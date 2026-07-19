"""
Cycle de vie des sessions (Vague 1) : rotation, détection de réutilisation,
logout serveur, invalidation au changement de mot de passe, rate limiting.

Nécessite TEST_DATABASE_URL (sinon skip).
"""
import uuid

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text

from conftest import requires_db
from main import Base, app, get_central_engine, hash_password, limiter

pytestmark = requires_db

PWD = "motdepasse123"


@pytest.fixture
async def user_email():
    """Crée un utilisateur de test dans le schéma central et le nettoie ensuite."""
    engine = get_central_engine()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    email = f"test_{uuid.uuid4().hex[:8]}@tontine.cm"
    async with engine.begin() as conn:
        await conn.execute(text("""
            INSERT INTO users (uuid, email, phone, hashed_password, first_name, last_name, global_role, is_active)
            VALUES (:u, :e, :p, :h, 'Test', 'User', 'membre', true)
        """), {"u": str(uuid.uuid4()), "e": email, "p": uuid.uuid4().hex[:12],
               "h": hash_password(PWD)})
    # Désactive le rate limiter par défaut (réactivé explicitement dans son test)
    limiter.enabled = False
    try:
        yield email
    finally:
        async with engine.begin() as conn:
            await conn.execute(text(
                "DELETE FROM refresh_tokens WHERE user_id IN (SELECT id FROM users WHERE email = :e)"
            ), {"e": email})
            # audit_logs référence users (FK sans cascade) : purger avant les users.
            await conn.execute(text(
                "DELETE FROM audit_logs WHERE user_id IN (SELECT id FROM users WHERE email = :e)"
            ), {"e": email})
            await conn.execute(text("DELETE FROM users WHERE email = :e"), {"e": email})
        limiter.enabled = True


def _client():
    return AsyncClient(transport=ASGITransport(app=app), base_url="http://test")


async def _login(client, email):
    r = await client.post("/auth/login", json={"email": email, "password": PWD})
    assert r.status_code == 200, r.text
    return r.json()


async def test_rotation_et_detection_de_reutilisation(user_email):
    async with _client() as client:
        data = await _login(client, user_email)
        rt1 = data["refresh_token"]

        r = await client.post("/auth/refresh", json={"refresh_token": rt1})
        assert r.status_code == 200
        rt2 = r.json()["refresh_token"]
        assert rt2 and rt2 != rt1

        # Rejouer l'ancien refresh (déjà tourné) => 401 + révocation en cascade
        replay = await client.post("/auth/refresh", json={"refresh_token": rt1})
        assert replay.status_code == 401

        # rt2 a été révoqué par la détection de réutilisation
        after = await client.post("/auth/refresh", json={"refresh_token": rt2})
        assert after.status_code == 401


async def test_logout_revoque_le_refresh(user_email):
    async with _client() as client:
        data = await _login(client, user_email)
        rt = data["refresh_token"]
        out = await client.post("/auth/logout", json={"refresh_token": rt})
        assert out.status_code == 200
        replay = await client.post("/auth/refresh", json={"refresh_token": rt})
        assert replay.status_code == 401


async def test_changement_mdp_invalide_les_sessions(user_email):
    async with _client() as client:
        data = await _login(client, user_email)
        access, rt = data["access_token"], data["refresh_token"]
        chg = await client.put(
            "/auth/me/password",
            headers={"Authorization": f"Bearer {access}"},
            json={"current_password": PWD, "new_password": "nouveaumdp123"},
        )
        assert chg.status_code == 200
        # Les refresh tokens antérieurs ne valent plus rien
        replay = await client.post("/auth/refresh", json={"refresh_token": rt})
        assert replay.status_code == 401


async def test_login_rate_limited(user_email):
    limiter.enabled = True
    async with _client() as client:
        codes = []
        for _ in range(7):
            r = await client.post("/auth/login", json={"email": user_email, "password": "mauvais"})
            codes.append(r.status_code)
        assert 429 in codes, f"Aucun 429 obtenu (limiter/IP keying ?) : {codes}"

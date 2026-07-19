"""
Modèle de rôles par tontine (#17). Vérifie que le rôle effectif dépend de la
tontine, que la multi-appartenance ne casse plus, et que le contexte se résout
correctement. Nécessite TEST_DATABASE_URL.
"""
import uuid

import pytest
from sqlalchemy import text
from sqlalchemy.ext.asyncio import async_sessionmaker

from conftest import requires_db
from main import (
    Base,
    User,
    get_central_engine,
    get_user_memberships,
    resolve_active_context,
)
from sqlalchemy import select

pytestmark = requires_db


@pytest.fixture
async def two_tontines_user():
    """Un utilisateur président dans la tontine A, simple membre dans la B."""
    engine = get_central_engine()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    suffix = uuid.uuid4().hex[:8]
    email = f"multi_{suffix}@tontine.cm"
    ids = {}
    async with engine.begin() as conn:
        ids["uid"] = (await conn.execute(text("""
            INSERT INTO users (uuid, email, phone, hashed_password, first_name, last_name, global_role, is_active)
            VALUES (:u, :e, :p, 'x', 'Multi', 'Role', 'president', true) RETURNING id
        """), {"u": str(uuid.uuid4()), "e": email, "p": suffix})).scalar_one()
        for key, name, role in [("a", f"A_{suffix}", "president"), ("b", f"B_{suffix}", "membre")]:
            tid = (await conn.execute(text("""
                INSERT INTO tontine_registry (uuid, name, slug, schema_name, type, status, currency)
                VALUES (:u, :n, :s, :sc, 'mixte', 'active', 'XAF') RETURNING id
            """), {"u": str(uuid.uuid4()), "n": name, "s": f"slug_{key}_{suffix}",
                   "sc": f"tontine_{key}_{suffix}"})).scalar_one()
            ids[key] = tid
            await conn.execute(text("""
                INSERT INTO tontine_members (user_id, tontine_id, role, status)
                VALUES (:uid, :tid, :role, 'active')
            """), {"uid": ids["uid"], "tid": tid, "role": role})
    try:
        yield ids
    finally:
        async with engine.begin() as conn:
            await conn.execute(text("DELETE FROM tontine_members WHERE user_id = :u"), {"u": ids["uid"]})
            await conn.execute(text("DELETE FROM tontine_registry WHERE id IN (:a, :b)"), {"a": ids["a"], "b": ids["b"]})
            await conn.execute(text("DELETE FROM users WHERE id = :u"), {"u": ids["uid"]})


async def _load_user(uid):
    factory = async_sessionmaker(get_central_engine(), expire_on_commit=False)
    async with factory() as s:
        return (await s.execute(select(User).where(User.id == uid))).scalar_one(), s


async def test_multi_appartenance_ne_crash_pas_et_role_par_tontine(two_tontines_user):
    ids = two_tontines_user
    factory = async_sessionmaker(get_central_engine(), expire_on_commit=False)
    async with factory() as s:
        user = (await s.execute(select(User).where(User.id == ids["uid"]))).scalar_one()
        memberships = await get_user_memberships(user, s)
        by_tid = {m["tontine_id"]: m["role"] for m in memberships}
        assert by_tid[ids["a"]] == "president"
        assert by_tid[ids["b"]] == "membre"


async def test_resolve_contexte_prefere_la_tontine_demandee(two_tontines_user):
    ids = two_tontines_user
    factory = async_sessionmaker(get_central_engine(), expire_on_commit=False)
    async with factory() as s:
        user = (await s.execute(select(User).where(User.id == ids["uid"]))).scalar_one()
        # Par défaut : première tontine (A) -> president
        default_ctx = await resolve_active_context(user, s)
        assert default_ctx["role"] == "president"
        # Sur demande explicite de B -> membre
        ctx_b = await resolve_active_context(user, s, prefer_tontine_id=ids["b"])
        assert ctx_b["tontine_id"] == ids["b"]
        assert ctx_b["role"] == "membre"


async def test_superadmin_contexte_plateforme():
    engine = get_central_engine()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    suffix = uuid.uuid4().hex[:8]
    async with engine.begin() as conn:
        uid = (await conn.execute(text("""
            INSERT INTO users (uuid, email, phone, hashed_password, first_name, last_name, global_role, is_active)
            VALUES (:u, :e, :p, 'x', 'Super', 'Admin', 'superadmin', true) RETURNING id
        """), {"u": str(uuid.uuid4()), "e": f"sa_{suffix}@tontine.cm", "p": suffix})).scalar_one()
    try:
        factory = async_sessionmaker(get_central_engine(), expire_on_commit=False)
        async with factory() as s:
            user = (await s.execute(select(User).where(User.id == uid))).scalar_one()
            ctx = await resolve_active_context(user, s)
            assert ctx["role"] == "superadmin"
            assert ctx["schema"] is None
            assert ctx["memberships"] == []
    finally:
        async with engine.begin() as conn:
            await conn.execute(text("DELETE FROM users WHERE id = :u"), {"u": uid})

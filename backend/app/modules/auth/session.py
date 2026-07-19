import logging
from datetime import datetime, timedelta
from typing import Any

import httpx
from fastapi import HTTPException, Request, status
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.core.config import (
    ACCESS_TOKEN_TTL,
    ENABLE_DEMO_DATA,
    ENVIRONMENT,
    GOOGLE_CLIENT_ID,
    GOOGLE_TOKENINFO_URL,
    GOOGLE_USERINFO_URL,
)
from app.core.database import get_central_engine
from app.core.models import AuditLog, User, UserRole
from app.core.security import (
    create_refresh_token,
    create_token,
    hash_password,
    verify_password,
)
from app.modules.auth.schema import TokenResponse

logger = logging.getLogger(__name__)

DEMO_PASSWORD = "demo1234"
DEMO_EMAILS = (
    "super@tontine.cm",
    "admin@tontine.cm",
    "president@tontine.cm",
    "secretaire@tontine.cm",
    "tresorier@tontine.cm",
    "censeur@tontine.cm",
    "membre@tontine.cm",
)


async def get_user_memberships(user: User, db: AsyncSession) -> list[dict[str, Any]]:
    by_tontine: dict[int, dict[str, Any]] = {}

    members = (await db.execute(text("""
        SELECT tm.tontine_id, tm.role, tr.name AS tontine_name, tr.schema_name
        FROM tontine_members tm
        JOIN tontine_registry tr ON tr.id = tm.tontine_id
        WHERE tm.user_id = :uid AND tm.status = 'active'
        ORDER BY tm.tontine_id
    """), {"uid": user.id})).mappings().all()
    for member in members:
        by_tontine[member["tontine_id"]] = {
            "tontine_id": member["tontine_id"],
            "tontine_name": member["tontine_name"],
            "schema": member["schema_name"],
            "role": member["role"],
        }

    assignments = (await db.execute(text("""
        SELECT ta.tontine_id, tr.name AS tontine_name, tr.schema_name
        FROM tontine_admin_assignments ta
        JOIN tontine_registry tr ON tr.id = ta.tontine_id
        WHERE ta.user_id = :uid
        ORDER BY ta.tontine_id
    """), {"uid": user.id})).mappings().all()
    for assignment in assignments:
        by_tontine[assignment["tontine_id"]] = {
            "tontine_id": assignment["tontine_id"],
            "tontine_name": assignment["tontine_name"],
            "schema": assignment["schema_name"],
            "role": UserRole.ADMIN.value,
        }

    return sorted(by_tontine.values(), key=lambda item: item["tontine_id"])


async def resolve_active_context(
    user: User,
    db: AsyncSession,
    prefer_tontine_id: int | None = None,
) -> dict[str, Any]:
    if user.global_role == UserRole.SUPERADMIN:
        return {
            "role": UserRole.SUPERADMIN.value,
            "schema": None,
            "tontine_id": None,
            "tontine_name": None,
            "memberships": [],
        }

    memberships = await get_user_memberships(user, db)
    if not memberships:
        return {
            "role": user.global_role.value,
            "schema": None,
            "tontine_id": None,
            "tontine_name": None,
            "memberships": [],
        }

    active = None
    if prefer_tontine_id is not None:
        active = next(
            (membership for membership in memberships if membership["tontine_id"] == prefer_tontine_id),
            None,
        )
    if active is None:
        active = memberships[0]

    return {
        "role": active["role"],
        "schema": active["schema"],
        "tontine_id": active["tontine_id"],
        "tontine_name": active["tontine_name"],
        "memberships": memberships,
    }


async def issue_auth_response(
    user: User,
    request: Request,
    db: AsyncSession,
    *,
    audit_action: str,
    audit_details: dict[str, Any] | None = None,
) -> TokenResponse:
    if not user.is_active:
        raise HTTPException(403, "Compte désactivé — contactez l'administrateur")

    ctx = await resolve_active_context(user, db)
    schema = ctx["schema"]
    token_payload = {
        "sub": str(user.id),
        "email": user.email,
        "role": ctx["role"],
        "name": user.full_name,
        "schema": schema,
        "tid": ctx["tontine_id"],
    }

    access_token = create_token(token_payload, timedelta(minutes=ACCESS_TOKEN_TTL))
    refresh_token = await create_refresh_token(user.id, db, ctx["tontine_id"])

    try:
        user.last_login = datetime.utcnow()
        await db.commit()
    except Exception as exc:
        await db.rollback()
        logger.warning("Mise à jour last_login non bloquante échouée: %s", exc)

    try:
        db.add(AuditLog(
            user_id=user.id,
            tontine_slug=schema,
            action=audit_action,
            resource="session",
            details=audit_details or {},
            ip_address=request.client.host if request.client else None,
        ))
        await db.commit()
    except Exception as exc:
        await db.rollback()
        logger.warning("Audit login non bloquant échoué: %s", exc)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user={
            "id": user.id,
            "email": user.email,
            "name": user.full_name,
            "role": ctx["role"],
            "schema": schema,
            "tontine_name": ctx["tontine_name"],
            "tontine_id": ctx["tontine_id"],
            "memberships": ctx["memberships"],
            "notification_prefs": user.notification_prefs,
        },
    )


async def verify_google_access_token(access_token: str) -> dict[str, Any]:
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "Connexion Google non configurée côté serveur",
        )

    token = access_token.strip()
    if not token:
        raise HTTPException(400, "Jeton Google manquant")

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            token_response = await client.get(
                GOOGLE_TOKENINFO_URL,
                params={"access_token": token},
            )
            if token_response.status_code != 200:
                raise HTTPException(401, "Jeton Google invalide ou expiré")

            token_info = token_response.json()
            if token_info.get("aud") != GOOGLE_CLIENT_ID:
                raise HTTPException(401, "Jeton Google non autorisé pour cette application")

            user_info: dict[str, Any] = {}
            if not token_info.get("email") or token_info.get("email_verified") is None:
                user_response = await client.get(
                    GOOGLE_USERINFO_URL,
                    headers={"Authorization": f"Bearer {token}"},
                )
                if user_response.status_code != 200:
                    raise HTTPException(401, "Profil Google inaccessible")
                user_info = user_response.json()
    except HTTPException:
        raise
    except httpx.RequestError as exc:
        logger.warning("Vérification Google impossible: %s", exc)
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "Impossible de contacter Google pour vérifier la connexion",
        )

    email = (user_info.get("email") or token_info.get("email") or "").strip().lower()
    verified = user_info.get(
        "email_verified",
        token_info.get("email_verified", token_info.get("verified_email", False)),
    )

    if not email:
        raise HTTPException(401, "Adresse e-mail Google introuvable")
    if str(verified).lower() not in {"true", "1"}:
        raise HTTPException(403, "Adresse e-mail Google non vérifiée")

    return {
        "email": email,
        "name": user_info.get("name") or token_info.get("name"),
        "picture": user_info.get("picture"),
    }


async def sync_demo_accounts() -> None:
    if ENVIRONMENT != "development" or not ENABLE_DEMO_DATA:
        return

    factory = async_sessionmaker(get_central_engine(), expire_on_commit=False)
    async with factory() as session:
        result = await session.execute(select(User).where(User.email.in_(DEMO_EMAILS)))
        users = result.scalars().all()
        changed = False
        for user in users:
            if not verify_password(DEMO_PASSWORD, user.hashed_password):
                user.hashed_password = hash_password(DEMO_PASSWORD)
                changed = True
        if changed:
            await session.commit()
            logger.info("Comptes de démonstration réalignés sur le mot de passe par défaut")

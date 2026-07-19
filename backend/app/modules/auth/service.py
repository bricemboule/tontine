from datetime import datetime, timedelta

from fastapi import HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.auth import repository
from app.core.security import (
    create_refresh_token,
    create_token,
    decode_token,
    hash_password,
    revoke_all_refresh_tokens,
    verify_password,
)
from app.modules.auth.schema import (
    ChangePasswordRequest,
    GoogleLoginRequest,
    LoginRequest,
    RefreshRequest,
    SwitchTontineRequest,
)
from app.modules.auth.session import (
    get_user_memberships,
    issue_auth_response,
    resolve_active_context,
    verify_google_access_token,
)
from app.core.config import ACCESS_TOKEN_TTL


def _token_payload(user, ctx: dict) -> dict:
    return {
        "sub": str(user.id),
        "email": user.email,
        "role": ctx["role"],
        "name": user.full_name,
        "schema": ctx["schema"],
        "tid": ctx["tontine_id"],
    }


async def login_email(req: LoginRequest, request: Request, db: AsyncSession):
    user = await repository.user_par_email(db, req.email)
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(401, "Email ou mot de passe incorrect")

    return await issue_auth_response(user, request, db, audit_action="LOGIN")


async def login_google(req: GoogleLoginRequest, request: Request, db: AsyncSession):
    profile = await verify_google_access_token(req.access_token)
    user = await repository.user_par_email_normalise(db, profile["email"])
    if not user:
        raise HTTPException(
            403,
            "Aucun compte TontinePro n'est associé à cette adresse Google. Contactez votre administrateur.",
        )

    return await issue_auth_response(
        user,
        request,
        db,
        audit_action="LOGIN_GOOGLE",
        audit_details={"provider": "google", "email": profile["email"]},
    )


async def rafraichir_token(req: RefreshRequest, db: AsyncSession):
    payload = decode_token(req.refresh_token)
    if payload.get("type") != "refresh" or not payload.get("jti"):
        raise HTTPException(401, "Token de rafraîchissement invalide")

    user_id = int(payload["sub"])
    stored = await repository.refresh_token_par_jti(db, payload["jti"])
    if stored is None:
        raise HTTPException(401, "Session inconnue — reconnectez-vous")
    if stored.revoked_at is not None:
        await revoke_all_refresh_tokens(user_id, db)
        raise HTTPException(401, "Réutilisation de session détectée — reconnectez-vous")

    user = await repository.user_par_id(db, user_id)
    if not user or not user.is_active:
        raise HTTPException(401, "Utilisateur introuvable ou désactivé")

    stored.revoked_at = datetime.utcnow()
    await db.commit()

    ctx = await resolve_active_context(user, db, prefer_tontine_id=payload.get("tid"))
    new_access = create_token(_token_payload(user, ctx), timedelta(minutes=ACCESS_TOKEN_TTL))
    new_refresh = await create_refresh_token(user.id, db, ctx["tontine_id"])
    return {"access_token": new_access, "refresh_token": new_refresh, "token_type": "bearer"}


async def changer_tontine(req: SwitchTontineRequest, current_user: dict, db: AsyncSession):
    user = await repository.user_par_id(db, int(current_user["sub"]))
    if not user or not user.is_active:
        raise HTTPException(401, "Utilisateur introuvable ou désactivé")

    ctx = await resolve_active_context(user, db, prefer_tontine_id=req.tontine_id)
    if ctx["tontine_id"] != req.tontine_id:
        raise HTTPException(403, "Vous n'appartenez pas à cette tontine")

    if req.refresh_token:
        try:
            old = decode_token(req.refresh_token)
            if old.get("jti"):
                await repository.revoquer_refresh_token(db, old["jti"])
        except HTTPException:
            pass

    new_access = create_token(_token_payload(user, ctx), timedelta(minutes=ACCESS_TOKEN_TTL))
    new_refresh = await create_refresh_token(user.id, db, ctx["tontine_id"])
    return {
        "access_token": new_access,
        "refresh_token": new_refresh,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.full_name,
            "role": ctx["role"],
            "schema": ctx["schema"],
            "tontine_name": ctx["tontine_name"],
            "tontine_id": ctx["tontine_id"],
            "memberships": ctx["memberships"],
            "notification_prefs": user.notification_prefs,
        },
    }


async def deconnecter(req: RefreshRequest, db: AsyncSession):
    try:
        payload = decode_token(req.refresh_token)
    except HTTPException:
        return {"message": "Déconnecté"}

    jti = payload.get("jti")
    if jti:
        await repository.revoquer_refresh_token(db, jti)
    return {"message": "Déconnecté"}


async def utilisateur_courant(current_user: dict, db: AsyncSession):
    user = await repository.user_par_id(db, int(current_user["sub"]))
    memberships = await get_user_memberships(user, db) if user else []
    return {**current_user, "memberships": memberships}


async def modifier_mot_de_passe(
    req: ChangePasswordRequest,
    current_user: dict,
    db: AsyncSession,
):
    user = await repository.user_par_id(db, int(current_user["sub"]))
    if not user:
        raise HTTPException(404, "Utilisateur introuvable")
    if not verify_password(req.current_password, user.hashed_password):
        raise HTTPException(400, "Mot de passe actuel incorrect")

    user.hashed_password = hash_password(req.new_password)
    await db.commit()
    await revoke_all_refresh_tokens(user.id, db)
    return {"message": "Mot de passe modifié avec succès. Reconnectez-vous."}

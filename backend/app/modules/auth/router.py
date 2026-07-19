from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.auth import service
from app.modules.auth.schema import (
    ChangePasswordRequest,
    GoogleLoginRequest,
    LoginRequest,
    RefreshRequest,
    SwitchTontineRequest,
    TokenResponse,
)
from app.core.security import get_current_user, limiter
from app.core.database import get_central_db

router = APIRouter(prefix="/auth", tags=["Authentification"])


@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
async def login(
    req: LoginRequest,
    request: Request,
    db: AsyncSession = Depends(get_central_db),
):
    return await service.login_email(req, request, db)


@router.post("/google", response_model=TokenResponse)
@limiter.limit("10/minute")
async def google_login(
    req: GoogleLoginRequest,
    request: Request,
    db: AsyncSession = Depends(get_central_db),
):
    return await service.login_google(req, request, db)


@router.post("/refresh")
@limiter.limit("30/minute")
async def refresh_token_endpoint(
    req: RefreshRequest,
    request: Request,
    db: AsyncSession = Depends(get_central_db),
):
    return await service.rafraichir_token(req, db)


@router.post("/switch-tontine")
async def switch_tontine(
    req: SwitchTontineRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_central_db),
):
    return await service.changer_tontine(req, current_user, db)


@router.post("/logout")
async def logout(req: RefreshRequest, db: AsyncSession = Depends(get_central_db)):
    return await service.deconnecter(req, db)


@router.get("/me")
async def get_me(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_central_db),
):
    return await service.utilisateur_courant(current_user, db)


@router.put("/me/password")
async def change_password(
    req: ChangePasswordRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_central_db),
):
    return await service.modifier_mot_de_passe(req, current_user, db)

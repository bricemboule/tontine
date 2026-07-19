from typing import Optional

from fastapi import APIRouter, Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.tenant import tenant_context
from app.modules.prets import service
from app.modules.prets.permissions import (
    peut_approuver_pret,
    peut_creer_pret,
    peut_rejeter_pret,
    peut_rembourser_pret,
)
from app.modules.prets.schema import CreationPret, RemboursementPret
from app.core.database import get_central_db
from app.core.security import get_current_user

router = APIRouter(tags=["Prêts"])


@router.post("/loans/calculate")
async def calculer_pret(req: dict):
    return service.calculer_pret(req)


@router.get("/loans")
async def lister_prets(
    loan_status: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.lister_prets(ctx, current_user, loan_status)


@router.post("/loans", status_code=201)
async def creer_pret(
    req: CreationPret,
    current_user: dict = peut_creer_pret,
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.creer_pret(ctx, req, current_user)


@router.get("/loans/{loan_id}")
async def obtenir_pret(
    loan_id: int,
    current_user: dict = Depends(get_current_user),
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.obtenir_pret(ctx, current_user, loan_id)


@router.get("/loans/{loan_id}/schedule")
async def echeancier_pret(
    loan_id: int,
    current_user: dict = Depends(get_current_user),
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.echeancier_pret(ctx, current_user, loan_id)


@router.post("/loans/{loan_id}/approve")
async def approuver_pret(
    loan_id: int,
    current_user: dict = peut_approuver_pret,
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.approuver_pret(ctx, loan_id, current_user)


@router.post("/loans/{loan_id}/reject")
async def rejeter_pret(
    loan_id: int,
    current_user: dict = peut_rejeter_pret,
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.rejeter_pret(ctx, loan_id)


@router.post("/loans/{loan_id}/repay", status_code=201)
async def rembourser_pret(
    loan_id: int,
    amount: Optional[float] = None,
    req: Optional[RemboursementPret] = None,
    current_user: dict = peut_rembourser_pret,
    central: AsyncSession = Depends(get_central_db),
    idempotency_key: Optional[str] = Header(None, alias="Idempotency-Key"),
):
    ctx = await tenant_context(current_user, central)
    return await service.rembourser_pret(ctx, loan_id, amount, req, current_user, idempotency_key)

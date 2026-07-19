from typing import Optional

from fastapi import APIRouter, Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.tenant import tenant_context
from app.modules.penalites import service
from app.modules.penalites.permissions import (
    peut_annuler_penalite,
    peut_creer_penalite,
    peut_payer_penalite,
)
from app.modules.penalites.schema import AnnulationPenalite, CreationPenalite, PaiementPenalite
from app.core.database import get_central_db
from app.core.security import get_current_user

router = APIRouter(tags=["Pénalités"])


@router.get("/penalties")
async def lister_penalites(
    penalty_status: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.lister_penalites(ctx, current_user, penalty_status)


@router.post("/penalties", status_code=201)
async def creer_penalite(
    req: CreationPenalite,
    current_user: dict = peut_creer_penalite,
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.creer_penalite(ctx, req, current_user)


@router.post("/penalties/{penalty_id}/pay")
async def payer_penalite(
    penalty_id: int,
    req: PaiementPenalite,
    current_user: dict = peut_payer_penalite,
    central: AsyncSession = Depends(get_central_db),
    idempotency_key: Optional[str] = Header(None, alias="Idempotency-Key"),
):
    ctx = await tenant_context(current_user, central)
    return await service.payer_penalite(ctx, penalty_id, req, current_user, idempotency_key)


@router.post("/penalties/{penalty_id}/cancel")
async def annuler_penalite(
    penalty_id: int,
    req: AnnulationPenalite,
    current_user: dict = peut_annuler_penalite,
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.annuler_penalite(ctx, penalty_id, req)

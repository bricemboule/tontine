from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.tenant import tenant_context
from app.modules.decaissements import service
from app.modules.decaissements.permissions import (
    peut_approuver_decaissement,
    peut_creer_decaissement,
    peut_lire_decaissements,
    peut_rejeter_decaissement,
)
from app.modules.decaissements.schema import CreationDecaissement, DecisionDecaissement
from app.core.database import get_central_db

router = APIRouter(tags=["Décaissements"])


@router.get("/payouts")
async def lister_decaissements(
    current_user: dict = peut_lire_decaissements,
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.lister_decaissements(ctx)


@router.post("/payouts", status_code=201)
async def creer_decaissement(
    req: CreationDecaissement,
    current_user: dict = peut_creer_decaissement,
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.creer_decaissement(ctx, req, current_user)


@router.post("/payouts/{payout_id}/approve")
async def approuver_decaissement(
    payout_id: int,
    current_user: dict = peut_approuver_decaissement,
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.approuver_decaissement(ctx, payout_id, current_user)


@router.post("/payouts/{payout_id}/reject")
async def rejeter_decaissement(
    payout_id: int,
    req: DecisionDecaissement,
    current_user: dict = peut_rejeter_decaissement,
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.rejeter_decaissement(ctx, payout_id, req)

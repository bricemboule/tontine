from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.tenant import tenant_context
from app.modules.cycles import service
from app.modules.cycles.permissions import (
    peut_activer_cycle,
    peut_cloturer_cycle,
    peut_creer_cycle,
    utilisateur_connecte,
)
from app.modules.cycles.schema import CreationCycle
from app.core.database import get_central_db

router = APIRouter(tags=["Cycles"])


@router.get("/cycles")
async def lister_cycles(
    current_user: dict = utilisateur_connecte,
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.lister_cycles(ctx)


@router.post("/cycles", status_code=201)
async def creer_cycle(
    req: CreationCycle,
    current_user: dict = peut_creer_cycle,
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.creer_cycle(ctx, req, current_user)


@router.post("/cycles/{cycle_id}/activate")
async def activer_cycle(
    cycle_id: int,
    current_user: dict = peut_activer_cycle,
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.activer_cycle(ctx, cycle_id)


@router.post("/cycles/{cycle_id}/close")
async def cloturer_cycle(
    cycle_id: int,
    current_user: dict = peut_cloturer_cycle,
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.cloturer_cycle(ctx, cycle_id)

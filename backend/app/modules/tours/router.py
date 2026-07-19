from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.tenant import tenant_context
from app.modules.tours import service
from app.modules.tours.permissions import peut_generer_tours, peut_payer_tour
from app.core.database import get_central_db
from app.core.security import get_current_user

router = APIRouter(tags=["Tours"])


@router.get("/tours")
async def lister_tours(
    current_user: dict = Depends(get_current_user),
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.lister_tours(ctx)


@router.post("/tours/auto-assign")
async def generer_tours(
    shuffle: bool = True,
    current_user: dict = peut_generer_tours,
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.generer_tours(ctx, shuffle, current_user)


@router.post("/tours/{tour_id}/paid")
async def payer_tour(
    tour_id: int,
    current_user: dict = peut_payer_tour,
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.payer_tour(ctx, tour_id, current_user)

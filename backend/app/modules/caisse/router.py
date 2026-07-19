from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.tenant import tenant_context
from app.modules.caisse import service
from app.modules.caisse.permissions import peut_lire_caisse
from app.core.database import get_central_db

router = APIRouter(tags=["Caisse"])


@router.get("/cash")
async def cash_dashboard(
    current_user: dict = peut_lire_caisse,
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.tableau_caisse(ctx)


@router.get("/cash/movements")
async def cash_movements(
    movement_type: Optional[str] = None,
    category: Optional[str] = None,
    page: int = 1,
    limit: int = Query(100, ge=1, le=500),
    current_user: dict = peut_lire_caisse,
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.mouvements_caisse(ctx, movement_type, category, page, limit)

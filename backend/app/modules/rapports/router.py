from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.tenant import tenant_context
from app.modules.rapports import service
from app.modules.rapports.permissions import (
    peut_exporter_rapport,
    peut_lire_rapport,
    utilisateur_connecte,
)
from app.core.database import get_central_db

router = APIRouter(tags=["Rapports"])


@router.get("/reports/cashflow")
async def flux_caisse(
    current_user: dict = utilisateur_connecte,
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.flux_caisse(ctx)


@router.get("/reports/summary")
async def resume_financier(
    current_user: dict = peut_lire_rapport,
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.resume_financier(ctx)


@router.post("/reports/export")
async def exporter_rapport(
    format: str = "excel",
    current_user: dict = peut_exporter_rapport,
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.exporter_rapport(ctx, current_user, format)

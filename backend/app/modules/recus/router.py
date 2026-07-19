from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.tenant import tenant_context
from app.modules.recus import service
from app.core.database import get_central_db
from app.core.security import get_current_user

router = APIRouter(tags=["Reçus"])


@router.get("/receipts")
async def lister_recus(
    page: int = 1,
    limit: int = Query(100, ge=1, le=500),
    current_user: dict = Depends(get_current_user),
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.lister_recus(ctx, current_user, page, limit)


@router.get("/receipts/{receipt_id}/pdf")
async def telecharger_recu_pdf(
    receipt_id: int,
    current_user: dict = Depends(get_current_user),
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.telecharger_recu_pdf(ctx, current_user, receipt_id)

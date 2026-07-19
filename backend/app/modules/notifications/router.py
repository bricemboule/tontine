from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.tenant import tenant_context
from app.modules.notifications import service
from app.core.database import get_central_db
from app.core.security import get_current_user

router = APIRouter(tags=["Notifications"])


@router.get("/notifications")
async def lister_notifications(
    current_user: dict = Depends(get_current_user),
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.lister_notifications(ctx, current_user)


@router.post("/notifications/{notif_id}/read")
async def marquer_notification_lue(
    notif_id: int,
    current_user: dict = Depends(get_current_user),
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.marquer_notification_lue(ctx, notif_id)


@router.post("/notifications/read-all")
async def marquer_toutes_notifications_lues(
    current_user: dict = Depends(get_current_user),
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.marquer_toutes_lues(ctx, current_user)

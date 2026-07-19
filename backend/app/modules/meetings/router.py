from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.tenant import tenant_context
from app.modules.meetings import service
from app.modules.meetings.permissions import (
    can_cancel_meeting,
    can_close_meeting,
    can_create_meeting,
    can_read_meeting,
    can_update_meeting,
)
from app.modules.meetings.schema import MeetingClose, MeetingCreate
from app.core.database import get_central_db
from app.core.security import get_current_user


router = APIRouter(tags=["Réunions"])


@router.get("/meetings")
async def list_meetings(
    current_user: dict = can_read_meeting,
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.list_meetings(ctx)


@router.post("/meetings", status_code=201)
async def create_meeting(
    req: MeetingCreate,
    current_user: dict = can_create_meeting,
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.create_meeting(ctx, req, current_user)


@router.put("/meetings/{meeting_id}")
async def update_meeting(
    meeting_id: int,
    req: MeetingCreate,
    current_user: dict = can_update_meeting,
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.update_meeting(ctx, meeting_id, req)


@router.post("/meetings/{meeting_id}/close")
async def close_meeting(
    meeting_id: int,
    req: MeetingClose,
    current_user: dict = can_close_meeting,
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.close_meeting(ctx, meeting_id, req, current_user)


@router.post("/meetings/{meeting_id}/cancel")
async def cancel_meeting(
    meeting_id: int,
    current_user: dict = can_cancel_meeting,
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.cancel_meeting(ctx, meeting_id)

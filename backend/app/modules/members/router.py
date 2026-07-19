from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.tenant import tenant_context
from app.modules.members import service
from app.modules.members.permissions import (
    can_create_member,
    can_offboard_member,
    can_read_outstanding,
    can_suspend_member,
    can_update_member,
    can_validate_member,
)
from app.modules.members.schema import MemberCreate, MemberUpdate, OffboardMember
from app.core.database import get_central_db
from app.core.security import get_current_user


router = APIRouter(tags=["Membres"])


@router.get("/members")
async def list_members(
    member_status: Optional[str] = None,
    search: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.list_members(ctx, current_user, member_status, search)


@router.post("/members", status_code=201)
async def create_member(
    req: MemberCreate,
    current_user: dict = can_create_member,
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.create_member(ctx, req, current_user, central)


@router.get("/members/{member_id}")
async def get_member(
    member_id: int,
    current_user: dict = Depends(get_current_user),
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.get_member(ctx, current_user, member_id)


@router.put("/members/{member_id}")
async def update_member(
    member_id: int,
    req: MemberUpdate,
    current_user: dict = can_update_member,
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.update_member(ctx, member_id, req, current_user, central)


@router.post("/members/{member_id}/validate")
async def validate_member(
    member_id: int,
    action: str,
    current_user: dict = can_validate_member,
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.validate_member(ctx, member_id, action, current_user, central)


@router.post("/members/{member_id}/suspend")
async def suspend_member(
    member_id: int,
    current_user: dict = can_suspend_member,
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.suspend_member(ctx, member_id, current_user, central)


@router.get("/members/{member_id}/outstanding")
async def member_outstanding(
    member_id: int,
    current_user: dict = can_read_outstanding,
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.get_member_outstanding(ctx, member_id)


@router.post("/members/{member_id}/offboard")
async def offboard_member(
    member_id: int,
    req: OffboardMember,
    current_user: dict = can_offboard_member,
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.offboard_member(ctx, member_id, req, current_user, central)


@router.post("/members/{member_id}/reinstate")
async def reinstate_member(
    member_id: int,
    current_user: dict = can_offboard_member,
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.reinstate_member(ctx, member_id, current_user, central)

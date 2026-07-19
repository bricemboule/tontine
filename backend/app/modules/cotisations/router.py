from typing import Optional

from fastapi import APIRouter, Depends, Header, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.tenant import tenant_context
from app.modules.cotisations import service
from app.modules.cotisations.permissions import (
    can_create_cotisation,
    can_update_cotisation,
    can_validate_cotisation,
)
from app.modules.cotisations.schema import CotisationCreate, CotisationPay
from app.core.database import get_central_db
from app.core.security import get_current_user

router = APIRouter(tags=["Cotisations"])


@router.get("/cotisations")
async def list_cotisations(
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: dict = Depends(get_current_user),
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.list_cotisations(ctx, current_user, status_filter)


@router.post("/cotisations", status_code=201)
async def create_cotisation(
    req: CotisationCreate,
    current_user: dict = can_create_cotisation,
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.create_cotisation(ctx, req, current_user)


@router.get("/cotisations/{cotisation_id}")
async def get_cotisation(
    cotisation_id: int,
    current_user: dict = Depends(get_current_user),
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.get_cotisation(ctx, cotisation_id)


@router.put("/cotisations/{cotisation_id}")
async def update_cotisation(
    cotisation_id: int,
    req: CotisationCreate,
    current_user: dict = can_update_cotisation,
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.update_cotisation(ctx, cotisation_id, req)


@router.post("/cotisations/{cotisation_id}/close")
async def close_cotisation(
    cotisation_id: int,
    current_user: dict = can_update_cotisation,
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.close_cotisation(ctx, cotisation_id)


@router.post("/cotisations/{cotisation_id}/enroll")
async def enroll_members(
    cotisation_id: int,
    payload: dict,
    current_user: dict = can_update_cotisation,
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.enroll_members(ctx, cotisation_id, payload)


@router.delete("/cotisations/{cotisation_id}/members/{member_id}")
async def unenroll_member(
    cotisation_id: int,
    member_id: int,
    current_user: dict = can_update_cotisation,
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.unenroll_member(ctx, cotisation_id, member_id)


@router.post("/cotisations/{cotisation_id}/pay", status_code=201)
async def pay_cotisation(
    cotisation_id: int,
    req: CotisationPay,
    current_user: dict = can_validate_cotisation,
    central: AsyncSession = Depends(get_central_db),
    idempotency_key: Optional[str] = Header(None, alias="Idempotency-Key"),
):
    ctx = await tenant_context(current_user, central)
    return await service.pay_cotisation(ctx, cotisation_id, req, current_user, idempotency_key)

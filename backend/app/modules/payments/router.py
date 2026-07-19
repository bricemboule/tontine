from typing import Optional

from fastapi import APIRouter, Depends, Header, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.tenant import tenant_context
from app.modules.payments import service
from app.modules.payments.permissions import (
    can_cancel_payment,
    can_create_payment,
    can_reverse_payment,
    can_validate_payment,
)
from app.modules.payments.schema import PaymentCancel, PaymentCreate
from app.core.database import get_central_db
from app.core.security import get_current_user

router = APIRouter(tags=["Paiements"])


@router.get("/payments")
async def list_payments(
    pay_status: Optional[str] = None,
    member_id: Optional[int] = None,
    page: int = 1,
    limit: int = Query(100, ge=1, le=500),
    current_user: dict = Depends(get_current_user),
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.list_payments(ctx, current_user, pay_status, member_id, page, limit)


@router.post("/payments/initiate", status_code=201)
async def initiate_payment(
    req: PaymentCreate,
    current_user: dict = can_create_payment,
    central: AsyncSession = Depends(get_central_db),
    idempotency_key: Optional[str] = Header(None, alias="Idempotency-Key"),
):
    ctx = await tenant_context(current_user, central)
    return await service.initiate_payment(ctx, req, current_user, central, idempotency_key)


@router.post("/payments/{payment_id}/validate")
async def validate_payment(
    payment_id: int,
    current_user: dict = can_validate_payment,
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.validate_payment(ctx, payment_id, current_user)


@router.post("/payments/{payment_id}/cancel")
async def cancel_payment(
    payment_id: int,
    req: PaymentCancel = PaymentCancel(),
    current_user: dict = can_cancel_payment,
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.cancel_payment(ctx, payment_id, req, current_user)


@router.post("/payments/{payment_id}/reverse")
async def reverse_payment(
    payment_id: int,
    req: PaymentCancel = PaymentCancel(),
    current_user: dict = can_reverse_payment,
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.reverse_payment(ctx, payment_id, req, current_user)

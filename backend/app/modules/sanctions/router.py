from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.tenant import tenant_context
from app.modules.sanctions import service
from app.modules.sanctions.permissions import (
    peut_creer_sanction,
    peut_lever_sanction,
    peut_valider_sanction,
)
from app.modules.sanctions.schema import CreationSanction, ValidationSanction
from app.core.database import get_central_db
from app.core.security import get_current_user

router = APIRouter(tags=["Sanctions"])


@router.get("/sanctions")
async def lister_sanctions(
    sanc_status: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.lister_sanctions(ctx, current_user, sanc_status)


@router.post("/sanctions", status_code=201)
async def proposer_sanction(
    req: CreationSanction,
    current_user: dict = peut_creer_sanction,
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.proposer_sanction(ctx, req, current_user)


@router.post("/sanctions/{sanction_id}/validate")
async def valider_sanction(
    sanction_id: int,
    req: ValidationSanction,
    current_user: dict = peut_valider_sanction,
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.valider_sanction(ctx, sanction_id, req, current_user)


@router.post("/sanctions/{sanction_id}/lift")
async def lever_sanction(
    sanction_id: int,
    reason: str = "Levée par le bureau",
    current_user: dict = peut_lever_sanction,
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.lever_sanction(ctx, sanction_id, reason, current_user)

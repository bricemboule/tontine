from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.tenant import tenant_context
from app.modules.tableaux_de_bord import service
from app.modules.tableaux_de_bord.permissions import (
    peut_lire_tableau_admin,
    peut_lire_tableau_membre,
)
from app.core.database import get_central_db

router = APIRouter(tags=["Tableaux de bord"])


@router.get("/dashboard/admin")
async def tableau_admin(
    current_user: dict = peut_lire_tableau_admin,
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.tableau_admin(ctx)


@router.get("/dashboard/member")
async def tableau_membre(
    current_user: dict = peut_lire_tableau_membre,
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.tableau_membre(ctx, current_user)

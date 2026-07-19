from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.tenant import tenant_context
from app.modules.parametres import service
from app.modules.parametres.permissions import (
    peut_modifier_parametres,
    utilisateur_connecte,
)
from app.modules.parametres.schema import ModificationParametres
from app.core.database import get_central_db

router = APIRouter(tags=["Paramètres"])


@router.get("/config")
async def obtenir_parametres(
    current_user: dict = utilisateur_connecte,
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.obtenir_parametres(ctx)


@router.put("/config")
async def modifier_parametres(
    req: ModificationParametres,
    current_user: dict = peut_modifier_parametres,
    central: AsyncSession = Depends(get_central_db),
):
    ctx = await tenant_context(current_user, central)
    return await service.modifier_parametres(ctx, req, current_user)

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.tenant import tenant_context
from app.core.database import get_central_db
from app.core.security import get_current_user

router = APIRouter(tags=["Tontines"])


@router.get("/tontines/current")
async def tontine_courante(
    current_user: dict = Depends(get_current_user),
    central: AsyncSession = Depends(get_central_db),
):
    return await tenant_context(current_user, central)

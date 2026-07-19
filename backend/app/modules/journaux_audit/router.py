from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.journaux_audit import service
from app.modules.journaux_audit.permissions import peut_lire_journal_audit
from app.core.database import get_central_db

router = APIRouter(tags=["Journaux d'audit"])


@router.get("/reports/audit")
async def journal_audit_tontine(
    page: int = 1,
    limit: int = 50,
    current_user: dict = peut_lire_journal_audit,
    db: AsyncSession = Depends(get_central_db),
):
    return await service.lister_journal_tontine(db, current_user, page, limit)

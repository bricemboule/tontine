from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.journaux_audit import repository


def _serialiser_log(log) -> dict:
    return {
        "id": log.id,
        "action": log.action,
        "resource": log.resource,
        "details": log.details,
        "at": log.created_at.isoformat() if log.created_at else None,
    }


async def lister_journal_tontine(
    db: AsyncSession,
    current_user: dict,
    page: int,
    limit: int,
) -> list[dict]:
    logs = await repository.lister_journal_tontine(
        db,
        current_user.get("schema"),
        page,
        limit,
    )
    return [_serialiser_log(log) for log in logs]

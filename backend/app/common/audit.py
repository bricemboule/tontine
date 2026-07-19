import logging
from typing import Optional

from sqlalchemy.ext.asyncio import async_sessionmaker

from app.core.database import get_central_engine
from app.core.models import AuditLog

logger = logging.getLogger(__name__)


async def audit(
    current_user: dict,
    action: str,
    resource: str,
    resource_id: Optional[str] = None,
    details: Optional[dict] = None,
) -> None:
    try:
        factory = async_sessionmaker(get_central_engine(), expire_on_commit=False)
        async with factory() as session:
            session.add(AuditLog(
                user_id=int(current_user.get("sub")) if current_user.get("sub") else None,
                tontine_slug=current_user.get("schema"),
                action=action,
                resource=resource,
                resource_id=str(resource_id) if resource_id is not None else None,
                details=details or {},
            ))
            await session.commit()
    except Exception as exc:
        logger.warning("Audit non bloquant échoué: %s", exc)


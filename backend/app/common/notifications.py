from typing import Optional

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def create_notification(
    db: AsyncSession,
    member_id: Optional[int],
    title: str,
    message: str,
    notif_type: str,
    link: Optional[str] = None,
) -> None:
    if member_id is None:
        return
    await db.execute(text("""
        INSERT INTO notifications (member_id, channel, subject, body, type, link, status)
        VALUES (:mid, 'app', :title, :body, :type, :link, 'sent')
    """), {"mid": member_id, "title": title, "body": message, "type": notif_type, "link": link})


from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def membre_par_utilisateur(db: AsyncSession, user_id: int):
    return (await db.execute(text(
        "SELECT id FROM members WHERE user_id = :uid LIMIT 1"
    ), {"uid": user_id})).scalar()


async def lister_notifications(db: AsyncSession, member_id: int | None):
    return (await db.execute(text("""
        SELECT id,
               COALESCE(subject, title, 'Notification') AS title,
               COALESCE(body, message, '') AS body,
               COALESCE(type, channel, 'info') AS type,
               COALESCE(link, '#') AS link,
               COALESCE(is_read, read_at IS NOT NULL) AS read,
               created_at::date AS date
        FROM notifications
        WHERE (CAST(:mid AS BIGINT) IS NULL OR member_id = :mid)
        ORDER BY created_at DESC
        LIMIT 80
    """), {"mid": member_id})).mappings().all()


async def marquer_notification_lue(db: AsyncSession, notif_id: int) -> None:
    await db.execute(text(
        "UPDATE notifications SET is_read = true, read_at = NOW() WHERE id = :id"
    ), {"id": notif_id})


async def marquer_toutes_lues(db: AsyncSession, member_id: int | None) -> None:
    await db.execute(text(
        "UPDATE notifications SET is_read = true, read_at = NOW() WHERE member_id = :mid"
    ), {"mid": member_id})

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def lister_cycles(db: AsyncSession):
    return (await db.execute(
        text("SELECT * FROM cycles ORDER BY start_date DESC")
    )).mappings().all()


async def creer_cycle(db: AsyncSession, values: dict):
    return (await db.execute(text("""
        INSERT INTO cycles (organization_id, tontine_id, name, start_date, end_date, expected_total_amount, status)
        VALUES (:org, :tid, :name, :start, :end, :expected, 'draft')
        RETURNING *
    """), values)).mappings().one()


async def terminer_cycles_actifs(db: AsyncSession) -> None:
    await db.execute(text("UPDATE cycles SET status = 'completed' WHERE status = 'active'"))


async def activer_cycle(db: AsyncSession, cycle_id: int):
    return (await db.execute(text("""
        UPDATE cycles SET status = 'active', updated_at = NOW() WHERE id = :id RETURNING *
    """), {"id": cycle_id})).mappings().one_or_none()


async def cloturer_cycle(db: AsyncSession, cycle_id: int):
    return (await db.execute(text("""
        UPDATE cycles SET status = 'completed', updated_at = NOW() WHERE id = :id RETURNING *
    """), {"id": cycle_id})).mappings().one_or_none()

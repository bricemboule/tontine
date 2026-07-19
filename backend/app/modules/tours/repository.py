from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def lister_tours(db: AsyncSession):
    return (await db.execute(text("""
        SELECT ta.id, ta.member_id AS mid, CONCAT(u.first_name, ' ', u.last_name) AS name,
               ta.order_position AS pos, ta.scheduled_date AS date,
               ta.amount_received AS amount, ta.status,
               ta.actual_date
        FROM tour_assignments ta
        JOIN members m ON m.id = ta.member_id
        JOIN public.users u ON u.id = m.user_id
        ORDER BY ta.order_position
    """))).mappings().all()


async def regenerer_tours(db: AsyncSession, melanger: bool) -> None:
    ordre_sql = "RANDOM()" if melanger else "joined_at, id"
    await db.execute(text("DELETE FROM tour_assignments"))
    await db.execute(text(f"""
        INSERT INTO tour_assignments (member_id, order_position, scheduled_date, amount_received, status)
        SELECT id, ROW_NUMBER() OVER (ORDER BY {ordre_sql}),
               CURRENT_DATE + ((ROW_NUMBER() OVER (ORDER BY {ordre_sql}) - 1) * INTERVAL '1 month'),
               0, 'pending'
        FROM members
        WHERE status = 'active'
    """))


async def lister_tours_apres_generation(db: AsyncSession):
    return (await db.execute(text("""
        SELECT ta.id, ta.member_id AS mid, CONCAT(u.first_name, ' ', u.last_name) AS name,
               ta.order_position AS pos, ta.scheduled_date AS date,
               ta.amount_received AS amount, ta.status
        FROM tour_assignments ta
        JOIN members m ON m.id = ta.member_id
        JOIN public.users u ON u.id = m.user_id
        ORDER BY ta.order_position
    """))).mappings().all()


async def obtenir_tour(db: AsyncSession, tour_id: int):
    return (await db.execute(text(
        "SELECT * FROM tour_assignments WHERE id = :id"
    ), {"id": tour_id})).mappings().one_or_none()


async def marquer_tour_paye(db: AsyncSession, tour_id: int, montant: float) -> None:
    await db.execute(text("""
        UPDATE tour_assignments SET status = 'completed', actual_date = CURRENT_DATE, amount_received = :amount
        WHERE id = :id
    """), {"id": tour_id, "amount": montant})

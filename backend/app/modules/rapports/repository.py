from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def flux_caisse_mensuel(db: AsyncSession):
    return (await db.execute(text("""
        SELECT TO_CHAR(created_at, 'Mon YYYY') AS label,
               COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE -amount END), 0) AS amount
        FROM cash_movements
        GROUP BY DATE_TRUNC('month', created_at), TO_CHAR(created_at, 'Mon YYYY')
        ORDER BY DATE_TRUNC('month', created_at)
        LIMIT 12
    """))).mappings().all()


async def totaux_rapport(db: AsyncSession):
    return (await db.execute(text("""
        SELECT
            (SELECT COALESCE(SUM(amount_paid),0) FROM member_cotisations) AS collecte,
            (SELECT COUNT(*) FROM members WHERE status='active') AS membres_actifs,
            (SELECT COALESCE(SUM(amount - paid_amount),0) FROM penalties WHERE status IN ('unpaid','partial')) AS penalites_dues,
            (SELECT COALESCE(SUM(remaining_amount),0) FROM loans WHERE status IN ('active','late')) AS prets_encours
    """))).mappings().one()


async def lignes_membres(db: AsyncSession):
    return (await db.execute(text("""
        SELECT CONCAT(u.first_name,' ',u.last_name) AS nom, u.phone, m.role, m.status, m.tour_order
        FROM members m JOIN public.users u ON u.id = m.user_id ORDER BY u.first_name
    """))).all()


async def lignes_paiements(db: AsyncSession):
    return (await db.execute(text("""
        SELECT p.reference, CONCAT(u.first_name,' ',u.last_name) AS membre, p.amount, p.method, p.status,
               COALESCE(p.payment_date, p.completed_at, p.initiated_at)::date AS date
        FROM payments p JOIN members m ON m.id = p.member_id JOIN public.users u ON u.id = m.user_id
        ORDER BY p.id DESC LIMIT 2000
    """))).all()


async def lignes_caisse(db: AsyncSession):
    return (await db.execute(text("""
        SELECT type, category, amount, description, created_at::date AS date
        FROM cash_movements ORDER BY id DESC LIMIT 2000
    """))).all()

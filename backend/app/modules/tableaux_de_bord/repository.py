from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def statistiques_admin(db: AsyncSession):
    return (await db.execute(text("""
        SELECT
            (SELECT COUNT(*) FROM members WHERE status = 'active') AS members_count,
            (SELECT COALESCE(SUM(amount_due), 0) FROM member_cotisations) AS expected_contributions,
            (SELECT COALESCE(SUM(amount_paid), 0) FROM member_cotisations) AS collected_contributions,
            (SELECT COUNT(*) FROM member_cotisations WHERE status = 'late') AS late_contributions,
            (SELECT COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE -amount END),0) FROM cash_movements) AS cash_balance,
            (SELECT COUNT(*) FROM penalties WHERE status IN ('unpaid','partial')) AS unpaid_penalties,
            (SELECT COUNT(*) FROM loans WHERE status = 'active') AS active_loans,
            (SELECT COUNT(*) FROM meetings WHERE status = 'upcoming' AND event_date >= CURRENT_DATE) AS upcoming_meetings
    """))).mappings().one()


async def prochain_beneficiaire(db: AsyncSession):
    return (await db.execute(text("""
        SELECT ta.*, CONCAT(u.first_name, ' ', u.last_name) AS member_name
        FROM tour_assignments ta
        JOIN members m ON m.id = ta.member_id
        JOIN public.users u ON u.id = m.user_id
        WHERE ta.status = 'pending'
        ORDER BY ta.order_position
        LIMIT 1
    """))).mappings().one_or_none()


async def membre_par_utilisateur(db: AsyncSession, user_id: int):
    return (await db.execute(text(
        "SELECT id FROM members WHERE user_id = :uid LIMIT 1"
    ), {"uid": user_id})).scalar()


async def statistiques_membre(db: AsyncSession, member_id: int):
    return (await db.execute(text("""
        SELECT
            (SELECT COALESCE(SUM(amount_paid), 0) FROM member_cotisations WHERE member_id = :mid) AS total_contributed,
            (SELECT COALESCE(SUM(amount_due - amount_paid), 0) FROM member_cotisations WHERE member_id = :mid AND status <> 'paid') AS remaining_contributions,
            (SELECT COALESCE(SUM(amount - paid_amount), 0) FROM penalties WHERE member_id = :mid AND status <> 'cancelled') AS penalties,
            (SELECT MIN(c.closing_date) FROM member_cotisations mc JOIN cotisations c ON c.id = mc.cotisation_id WHERE mc.member_id = :mid AND mc.status <> 'paid') AS next_payment,
            (SELECT order_position FROM tour_assignments WHERE member_id = :mid LIMIT 1) AS payout_turn,
            (SELECT COUNT(*) FROM loans WHERE member_id = :mid AND status = 'active') AS active_loans,
            (SELECT COUNT(*) FROM notifications WHERE member_id = :mid AND COALESCE(is_read, false) = false) AS unread_notifications
    """), {"mid": member_id})).mappings().one()

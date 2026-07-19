from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def lister_mouvements_caisse(db: AsyncSession):
    return (await db.execute(text("""
        SELECT * FROM cash_movements ORDER BY created_at DESC LIMIT 100
    """))).mappings().all()


async def totaux_caisse(db: AsyncSession):
    return (await db.execute(text("""
        SELECT
            COALESCE(SUM(amount) FILTER (WHERE type='income' AND category='contribution'),0) AS total_contributions,
            COALESCE(SUM(amount) FILTER (WHERE type='income' AND category='penalty'),0) AS total_penalties,
            COALESCE(SUM(amount) FILTER (WHERE type='income' AND category='loan_repayment'),0) AS total_loan_repayments,
            COALESCE(SUM(amount) FILTER (WHERE type='expense' AND category='payout'),0) AS total_payouts,
            COALESCE(SUM(amount) FILTER (WHERE type='expense' AND category='expense'),0) AS total_expenses,
            COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE -amount END),0) AS balance
        FROM cash_movements
    """))).mappings().one()


async def mouvements_caisse_pages(
    db: AsyncSession,
    movement_type: str | None,
    category: str | None,
    page: int,
    limit: int,
):
    return (await db.execute(text("""
        SELECT * FROM cash_movements
        WHERE (CAST(:type AS VARCHAR) IS NULL OR type = :type)
          AND (CAST(:category AS VARCHAR) IS NULL OR category = :category)
        ORDER BY created_at DESC
        LIMIT :limit OFFSET :offset
    """), {
        "type": movement_type,
        "category": category,
        "limit": limit,
        "offset": (max(page, 1) - 1) * limit,
    })).mappings().all()

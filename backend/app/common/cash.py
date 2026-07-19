from typing import Optional

from fastapi import HTTPException
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession


async def get_cash_balance(db: AsyncSession) -> float:
    row = (await db.execute(text(
        "SELECT balance FROM cash_account WHERE id = 1"
    ))).scalar_one_or_none()
    return float(row or 0)


async def lock_cash_balance(db: AsyncSession) -> float:
    row = (await db.execute(text(
        "SELECT balance FROM cash_account WHERE id = 1 FOR UPDATE"
    ))).scalar_one_or_none()
    if row is None:
        await db.execute(text(
            "INSERT INTO cash_account (id, balance) VALUES (1, 0) ON CONFLICT DO NOTHING"
        ))
        row = (await db.execute(text(
            "SELECT balance FROM cash_account WHERE id = 1 FOR UPDATE"
        ))).scalar_one()
    return float(row)


async def add_cash_movement(
    db: AsyncSession,
    organization_id: int,
    tontine_id: int,
    movement_type: str,
    category: str,
    amount: float,
    description: str,
    reference_type: Optional[str],
    reference_id: Optional[int],
    created_by: int,
) -> None:
    await db.execute(text("""
        INSERT INTO cash_movements (
            organization_id, tontine_id, type, category, amount, description,
            reference_type, reference_id, created_by
        )
        VALUES (:org, :tid, :type, :category, :amount, :description, :rtype, :rid, :by)
    """), {
        "org": organization_id,
        "tid": tontine_id,
        "type": movement_type,
        "category": category,
        "amount": amount,
        "description": description,
        "rtype": reference_type,
        "rid": reference_id,
        "by": created_by,
    })
    delta = amount if movement_type == "income" else -amount
    try:
        await db.execute(text(
            "UPDATE cash_account SET balance = balance + :delta, updated_at = NOW() WHERE id = 1"
        ), {"delta": delta})
    except IntegrityError:
        raise HTTPException(409, "Solde de caisse insuffisant pour cette opération")

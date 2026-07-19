import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def create_receipt(
    db: AsyncSession,
    organization_id: int,
    tontine_id: int,
    member_id: int,
    payment_id: Optional[int],
    receipt_type: str,
    amount: float,
    method: str,
    reference: str,
    recorded_by: int,
) -> str:
    number = f"REC-{datetime.utcnow():%Y%m%d}-{uuid.uuid4().hex[:8].upper()}"
    await db.execute(text("""
        INSERT INTO receipts (
            organization_id, tontine_id, member_id, payment_id, number, type,
            amount, payment_method, payment_reference, recorded_by
        )
        VALUES (:org, :tid, :mid, :pid, :number, :type, :amount, :method, :ref, :by)
    """), {
        "org": organization_id,
        "tid": tontine_id,
        "mid": member_id,
        "pid": payment_id,
        "number": number,
        "type": receipt_type,
        "amount": amount,
        "method": method,
        "ref": reference,
        "by": recorded_by,
    })
    return number


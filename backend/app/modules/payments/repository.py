from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.payments.schema import PaymentCreate


async def list_payments(
    db: AsyncSession,
    pay_status: str | None,
    member_id: int | None,
    user_id: int,
    member_only: bool,
    page: int,
    limit: int,
):
    return (await db.execute(text(f"""
        SELECT p.id, p.reference AS ref, p.reference, p.member_id AS mid,
               CONCAT(u.first_name, ' ', u.last_name) AS name,
               p.amount, p.method, p.status,
               COALESCE(p.payment_date, p.completed_at, p.initiated_at)::date AS date,
               p.description AS desc,
               p.payment_date, p.initiated_at, p.completed_at,
               p.cancellation_reason
        FROM payments p
        JOIN members m ON m.id = p.member_id
        JOIN public.users u ON u.id = m.user_id
        WHERE (CAST(:status AS VARCHAR) IS NULL OR p.status = :status)
          AND (CAST(:member_id AS BIGINT) IS NULL OR p.member_id = :member_id)
          AND ({'m.user_id = :uid' if member_only else 'TRUE'})
        ORDER BY COALESCE(p.payment_date, p.initiated_at) DESC
        LIMIT :limit OFFSET :offset
    """), {
        "status": pay_status,
        "member_id": member_id,
        "uid": user_id,
        "limit": limit,
        "offset": (max(page, 1) - 1) * limit,
    })).mappings().all()


async def create_payment(
    db: AsyncSession,
    ctx: dict,
    req: PaymentCreate,
    reference: str,
    method: str,
    status_value: str,
    recorded_by: int,
) -> int:
    return (await db.execute(text("""
        INSERT INTO payments (organization_id, tontine_id, contribution_id, reference, member_id, amount, method,
                              status, phone_number, description, payment_date, recorded_by)
        VALUES (:org, :tid, :cid, :ref, :mid, :amount, :method, :status, :phone, :desc, NOW(), :by)
        RETURNING id
    """), {
        "org": ctx["organization_id"],
        "tid": ctx["tontine_id"],
        "cid": req.contribution_id,
        "ref": reference,
        "mid": req.member_id,
        "amount": req.amount,
        "method": method,
        "status": status_value,
        "phone": req.phone,
        "desc": req.description,
        "by": recorded_by,
    })).scalar()


async def get_payment(db: AsyncSession, payment_id: int):
    return (await db.execute(text(
        "SELECT * FROM payments WHERE id = :id"
    ), {"id": payment_id})).mappings().one_or_none()


async def get_payment_by_reference(db: AsyncSession, reference: str):
    return (await db.execute(text(
        "SELECT * FROM payments WHERE reference = :r"
    ), {"r": reference})).mappings().one_or_none()


async def mark_payment_success(db: AsyncSession, payment_id: int, recorded_by: int) -> None:
    await db.execute(text("""
        UPDATE payments SET status = 'success', validated_by = :by, validated_at = NOW(),
            completed_at = NOW(), updated_at = NOW()
        WHERE id = :id
    """), {"by": recorded_by, "id": payment_id})


async def member_cotisation_for_payment(db: AsyncSession, contribution_id: int, member_id: int):
    return (await db.execute(text("""
        SELECT * FROM member_cotisations WHERE cotisation_id = :cid AND member_id = :mid
    """), {"cid": contribution_id, "mid": member_id})).mappings().one_or_none()


async def update_member_cotisation_paid(db: AsyncSession, member_cotisation_id: int, paid: float, status_value: str) -> None:
    await db.execute(text("""
        UPDATE member_cotisations SET amount_paid = :paid, status = :status,
            paid_at = CASE WHEN :status = 'paid' THEN NOW() ELSE paid_at END
        WHERE id = :id
    """), {"paid": paid, "status": status_value, "id": member_cotisation_id})


async def cancel_pending_payment(db: AsyncSession, payment_id: int, reason: str):
    return (await db.execute(text("""
        UPDATE payments SET status = 'cancelled', cancellation_reason = :reason, updated_at = NOW()
        WHERE id = :id AND status <> 'success'
        RETURNING id
    """), {"id": payment_id, "reason": reason})).mappings().one_or_none()


async def mark_payment_reversed(db: AsyncSession, payment_id: int, reason: str) -> None:
    await db.execute(text(
        "UPDATE payments SET status = 'reversed', reversed_at = NOW(), "
        "cancellation_reason = :reason, updated_at = NOW() WHERE id = :id"
    ), {"reason": reason, "id": payment_id})


async def reverse_member_cotisation(db: AsyncSession, contribution_id: int, member_id: int, amount: float) -> None:
    await db.execute(text("""
        UPDATE member_cotisations
        SET amount_paid = GREATEST(0, amount_paid - :amt),
            status = CASE WHEN GREATEST(0, amount_paid - :amt) <= 0 THEN 'pending' ELSE 'partial' END,
            paid_at = NULL, updated_at = NOW()
        WHERE cotisation_id = :cid AND member_id = :mid
    """), {"amt": amount, "cid": contribution_id, "mid": member_id})


async def mark_payment_failed(db: AsyncSession, payment_id: int) -> None:
    await db.execute(text(
        "UPDATE payments SET status = 'failed', updated_at = NOW() WHERE id = :id"
    ), {"id": payment_id})

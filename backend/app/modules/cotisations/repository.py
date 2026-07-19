from datetime import date, timedelta

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.notifications import create_notification
from app.modules.cotisations.schema import CotisationCreate, CotisationPay
from app.common.finance import calc_penalty


async def refresh_late_cotisations(db: AsyncSession) -> None:
    await db.execute(text("""
        UPDATE member_cotisations mc
        SET status = CASE
            WHEN amount_paid >= amount_due THEN 'paid'
            WHEN amount_paid > 0 AND c.closing_date >= CURRENT_DATE THEN 'partial'
            WHEN amount_paid < amount_due AND c.closing_date < CURRENT_DATE THEN 'late'
            ELSE 'pending'
        END
        FROM cotisations c
        WHERE c.id = mc.cotisation_id
    """))


async def apply_late_penalties(db: AsyncSession) -> int:
    cfg = None
    has_config = (await db.execute(text(
        "SELECT to_regclass('tontine_config')"
    ))).scalar()
    if has_config:
        cfg = (await db.execute(text(
            "SELECT penalty_rate, grace_days FROM tontine_config LIMIT 1"
        ))).mappings().one_or_none()
    penalty_rate = float(cfg["penalty_rate"]) if cfg and cfg["penalty_rate"] is not None else 5.0
    grace_days = int(cfg["grace_days"]) if cfg and cfg["grace_days"] is not None else 3

    await refresh_late_cotisations(db)
    late = (await db.execute(text("""
        SELECT mc.id, mc.member_id, mc.amount_due, mc.amount_paid,
               mc.organization_id, mc.tontine_id, c.closing_date
        FROM member_cotisations mc
        JOIN cotisations c ON c.id = mc.cotisation_id
        WHERE mc.status = 'late'
          AND NOT EXISTS (
              SELECT 1 FROM penalties p
              WHERE p.reference_type = 'cotisation' AND p.reference_id = mc.id
          )
    """))).mappings().all()

    created = 0
    today = date.today()
    for mc in late:
        remaining = float(mc["amount_due"] or 0) - float(mc["amount_paid"] or 0)
        due = mc["closing_date"]
        if remaining <= 0 or due is None:
            continue
        amount = calc_penalty(remaining, due, today, grace_days, penalty_rate)
        if amount <= 0:
            continue
        await db.execute(text("""
            INSERT INTO penalties (organization_id, tontine_id, member_id, reason, amount,
                                   status, due_date, reference_type, reference_id)
            VALUES (:org, :tid, :mid, :reason, :amount, 'unpaid', :due, 'cotisation', :ref)
            -- L'index d'unicité est PARTIEL (WHERE reference_type IS NOT NULL) :
            -- le prédicat doit figurer dans ON CONFLICT pour que Postgres l'infère.
            ON CONFLICT (reference_type, reference_id) WHERE reference_type IS NOT NULL DO NOTHING
        """), {
            "org": mc["organization_id"],
            "tid": mc["tontine_id"],
            "mid": mc["member_id"],
            "reason": "Retard de cotisation",
            "amount": amount,
            "due": today + timedelta(days=7),
            "ref": mc["id"],
        })
        await create_notification(
            db,
            mc["member_id"],
            "Pénalité de retard",
            f"Une pénalité de {amount:,.0f} XAF a été appliquée pour cotisation en retard.",
            "penalty_added",
            "/member/penalties",
        )
        created += 1
    return created


async def list_cotisations(db: AsyncSession, status_filter: str | None, user_id: int, member_only: bool):
    return (await db.execute(text(f"""
        SELECT c.id, c.label, c.amount, c.due_date AS date_debut,
               c.closing_date AS date_fin, c.status, c.cycle_id,
               COUNT(mc.id) AS total_inscrits,
               COUNT(mc.id) FILTER (WHERE mc.status = 'paid') AS total_paid,
               COALESCE(SUM(mc.amount_paid), 0) AS montant_collecte,
               COALESCE(SUM(mc.amount_due - mc.amount_paid), 0) AS montant_restant,
               MIN(mc.status) AS member_status
        FROM cotisations c
        LEFT JOIN member_cotisations mc ON mc.cotisation_id = c.id
        LEFT JOIN members m ON m.id = mc.member_id
        WHERE (CAST(:status AS VARCHAR) IS NULL OR c.status = :status)
          AND ({'m.user_id = :uid' if member_only else 'TRUE'})
        GROUP BY c.id
        ORDER BY c.due_date DESC, c.created_at DESC
    """), {"status": status_filter, "uid": user_id})).mappings().all()


async def active_cycle_id(db: AsyncSession):
    return (await db.execute(text(
        "SELECT id FROM cycles WHERE status = 'active' ORDER BY id DESC LIMIT 1"
    ))).scalar()


async def create_cotisation(db: AsyncSession, ctx: dict, req: CotisationCreate, cycle_id, created_by: int):
    return (await db.execute(text("""
        INSERT INTO cotisations (organization_id, tontine_id, cycle_id, label, amount, due_date, closing_date, status, created_by)
        VALUES (:org, :tid, :cycle, :label, :amount, :due, :closing, 'open', :by)
        RETURNING id, label, amount, due_date AS date_debut, closing_date AS date_fin, status
    """), {
        "org": ctx["organization_id"],
        "tid": ctx["tontine_id"],
        "cycle": cycle_id,
        "label": req.label,
        "amount": req.amount,
        "due": req.date_debut,
        "closing": req.date_fin,
        "by": created_by,
    })).mappings().one()


async def enroll_active_members(db: AsyncSession, ctx: dict, cotisation_id: int, amount: float) -> None:
    await db.execute(text("""
        INSERT INTO member_cotisations (organization_id, tontine_id, member_id, cotisation_id, status, amount_due, amount_paid)
        SELECT :org, :tid, id, :cid, 'pending', :amount, 0
        FROM members WHERE status = 'active'
        ON CONFLICT (member_id, cotisation_id) DO NOTHING
    """), {"org": ctx["organization_id"], "tid": ctx["tontine_id"], "cid": cotisation_id, "amount": amount})


async def create_contribution_rows(db: AsyncSession, ctx: dict, cycle_id, amount: float, due_date) -> None:
    await db.execute(text("""
        INSERT INTO contributions (organization_id, tontine_id, cycle_id, member_id, amount, due_date, paid_amount, remaining_amount, status)
        SELECT :org, :tid, :cycle, id, :amount, :due, 0, :amount, 'pending'
        FROM members WHERE status = 'active'
    """), {"org": ctx["organization_id"], "tid": ctx["tontine_id"], "cycle": cycle_id, "amount": amount, "due": due_date})


async def get_cotisation(db: AsyncSession, cotisation_id: int):
    return (await db.execute(text("""
        SELECT c.id, c.label, c.amount, c.due_date AS date_debut,
               c.closing_date AS date_fin, c.status, c.cycle_id,
               COUNT(mc.id) AS total_inscrits,
               COUNT(mc.id) FILTER (WHERE mc.status = 'paid') AS total_paid,
               COALESCE(SUM(mc.amount_paid), 0) AS montant_collecte
        FROM cotisations c
        LEFT JOIN member_cotisations mc ON mc.cotisation_id = c.id
        WHERE c.id = :id
        GROUP BY c.id
    """), {"id": cotisation_id})).mappings().one_or_none()


async def list_cotisation_members(db: AsyncSession, cotisation_id: int):
    return (await db.execute(text("""
        SELECT mc.*, CONCAT(u.first_name, ' ', u.last_name) AS name, u.phone
        FROM member_cotisations mc
        JOIN members m ON m.id = mc.member_id
        JOIN public.users u ON u.id = m.user_id
        WHERE mc.cotisation_id = :id
        ORDER BY name
    """), {"id": cotisation_id})).mappings().all()


async def update_cotisation(db: AsyncSession, cotisation_id: int, req: CotisationCreate):
    return (await db.execute(text("""
        UPDATE cotisations
        SET label = :label, amount = :amount, due_date = :due, closing_date = :closing, updated_at = NOW()
        WHERE id = :id
        RETURNING id, label, amount, due_date AS date_debut, closing_date AS date_fin, status
    """), {"id": cotisation_id, "label": req.label, "amount": req.amount, "due": req.date_debut, "closing": req.date_fin})).mappings().one_or_none()


async def update_unpaid_member_amounts(db: AsyncSession, cotisation_id: int, amount: float) -> None:
    await db.execute(text("""
        UPDATE member_cotisations SET amount_due = :amount, updated_at = NOW()
        WHERE cotisation_id = :id AND amount_paid = 0
    """), {"id": cotisation_id, "amount": amount})


async def close_cotisation(db: AsyncSession, cotisation_id: int):
    return (await db.execute(text("""
        UPDATE cotisations SET status = 'closed', updated_at = NOW()
        WHERE id = :id RETURNING *
    """), {"id": cotisation_id})).mappings().one_or_none()


async def get_cotisation_amount(db: AsyncSession, cotisation_id: int):
    return (await db.execute(text(
        "SELECT amount FROM cotisations WHERE id = :id"
    ), {"id": cotisation_id})).mappings().one_or_none()


async def enroll_members(db: AsyncSession, ctx: dict, cotisation_id: int, amount: float, member_ids: list[int]) -> int:
    enrolled = 0
    for member_id in member_ids:
        await db.execute(text("""
            INSERT INTO member_cotisations (organization_id, tontine_id, member_id, cotisation_id, status, amount_due, amount_paid)
            VALUES (:org, :tid, :mid, :cid, 'pending', :amount, 0)
            ON CONFLICT (member_id, cotisation_id) DO NOTHING
        """), {"org": ctx["organization_id"], "tid": ctx["tontine_id"], "mid": member_id, "cid": cotisation_id, "amount": amount})
        enrolled += 1
    return enrolled


async def unenroll_member(db: AsyncSession, cotisation_id: int, member_id: int) -> None:
    await db.execute(text("""
        DELETE FROM member_cotisations
        WHERE cotisation_id = :cid AND member_id = :mid AND amount_paid = 0
    """), {"cid": cotisation_id, "mid": member_id})


async def member_cotisation_for_payment(db: AsyncSession, cotisation_id: int, req: CotisationPay):
    return (await db.execute(text("""
        SELECT mc.*, c.label
        FROM member_cotisations mc
        JOIN cotisations c ON c.id = mc.cotisation_id
        WHERE mc.cotisation_id = :cid AND mc.member_id = :mid
    """), {"cid": cotisation_id, "mid": req.member_id})).mappings().one_or_none()


async def create_cotisation_payment(
    db: AsyncSession,
    ctx: dict,
    cotisation_id: int,
    req: CotisationPay,
    reference: str,
    method: str,
    description: str,
    recorded_by: int,
) -> int:
    return (await db.execute(text("""
        INSERT INTO payments (organization_id, tontine_id, contribution_id, reference, member_id, amount, method,
                              status, description, validated_by, validated_at, payment_date, completed_at, recorded_by)
        VALUES (:org, :tid, :cid, :ref, :mid, :amount, :method, 'success', :desc, :by, NOW(), NOW(), NOW(), :by)
        RETURNING id
    """), {
        "org": ctx["organization_id"],
        "tid": ctx["tontine_id"],
        "cid": cotisation_id,
        "ref": reference,
        "mid": req.member_id,
        "amount": req.amount,
        "method": method,
        "desc": description,
        "by": recorded_by,
    })).scalar()


async def update_member_cotisation_payment(db: AsyncSession, member_cotisation_id: int, paid: float, status_value: str) -> None:
    await db.execute(text("""
        UPDATE member_cotisations
        SET amount_paid = :paid, status = :status,
            paid_at = CASE WHEN :status = 'paid' THEN NOW() ELSE paid_at END,
            updated_at = NOW()
        WHERE id = :id
    """), {"paid": paid, "status": status_value, "id": member_cotisation_id})

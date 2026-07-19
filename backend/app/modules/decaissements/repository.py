from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.decaissements.schema import CreationDecaissement


async def lister_decaissements(db: AsyncSession):
    return (await db.execute(text("""
        SELECT p.*, CONCAT(u.first_name, ' ', u.last_name) AS member_name
        FROM payouts p
        LEFT JOIN members m ON m.id = p.member_id
        LEFT JOIN public.users u ON u.id = m.user_id
        ORDER BY p.created_at DESC
    """))).mappings().all()


async def creer_decaissement(db: AsyncSession, ctx: dict, req: CreationDecaissement, demande_par: int):
    return (await db.execute(text("""
        INSERT INTO payouts (organization_id, tontine_id, cycle_id, member_id, amount, reason, payout_turn_id, requested_by, status)
        VALUES (:org, :tid, :cycle, :member, :amount, :reason, :turn, :by, 'pending')
        RETURNING *
    """), {
        "org": ctx["organization_id"],
        "tid": ctx["tontine_id"],
        "cycle": req.cycle_id,
        "member": req.member_id,
        "amount": req.amount,
        "reason": req.reason,
        "turn": req.payout_turn_id,
        "by": demande_par,
    })).mappings().one()


async def obtenir_decaissement(db: AsyncSession, decaissement_id: int):
    return (await db.execute(text(
        "SELECT * FROM payouts WHERE id = :id"
    ), {"id": decaissement_id})).mappings().one_or_none()


async def marquer_decaissement_paye(db: AsyncSession, decaissement_id: int, approuve_par: int) -> None:
    await db.execute(text("""
        UPDATE payouts SET status = 'paid', approved_by = :by, paid_at = NOW(), updated_at = NOW()
        WHERE id = :id
    """), {"id": decaissement_id, "by": approuve_par})


async def marquer_tour_decaissement_paye(db: AsyncSession, payout_turn_id: int) -> None:
    await db.execute(text(
        "UPDATE payout_turns SET status = 'paid', paid_at = NOW() WHERE id = :id"
    ), {"id": payout_turn_id})


async def rejeter_decaissement(db: AsyncSession, decaissement_id: int) -> None:
    await db.execute(text(
        "UPDATE payouts SET status = 'rejected', updated_at = NOW() WHERE id = :id"
    ), {"id": decaissement_id})

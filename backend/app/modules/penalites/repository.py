from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.penalites.schema import CreationPenalite


async def lister_penalites(
    db: AsyncSession,
    statut: str | None,
    user_id: int,
    membre_uniquement: bool,
):
    return (await db.execute(text(f"""
        SELECT p.*, p.member_id AS mid, CONCAT(u.first_name, ' ', u.last_name) AS name,
               p.amount AS fine, p.created_at::date AS date
        FROM penalties p
        JOIN members m ON m.id = p.member_id
        JOIN public.users u ON u.id = m.user_id
        WHERE (CAST(:status AS VARCHAR) IS NULL OR p.status = :status)
          AND ({'m.user_id = :uid' if membre_uniquement else 'TRUE'})
        ORDER BY p.created_at DESC
    """), {"status": statut, "uid": user_id})).mappings().all()


async def creer_penalite(db: AsyncSession, ctx: dict, req: CreationPenalite, cree_par: int):
    return (await db.execute(text("""
        INSERT INTO penalties (organization_id, tontine_id, member_id, reason, amount, status, due_date, created_by)
        VALUES (:org, :tid, :mid, :reason, :amount, 'unpaid', :due, :by)
        RETURNING *
    """), {
        "org": ctx["organization_id"],
        "tid": ctx["tontine_id"],
        "mid": req.member_id,
        "reason": req.reason,
        "amount": req.amount,
        "due": req.due_date,
        "by": cree_par,
    })).mappings().one()


async def obtenir_penalite(db: AsyncSession, penalite_id: int):
    return (await db.execute(text(
        "SELECT * FROM penalties WHERE id = :id"
    ), {"id": penalite_id})).mappings().one_or_none()


async def creer_paiement_penalite(
    db: AsyncSession,
    ctx: dict,
    penalite,
    montant: float,
    methode: str,
    reference: str,
    enregistre_par: int,
) -> int:
    return (await db.execute(text("""
        INSERT INTO payments (organization_id, tontine_id, reference, member_id, amount, method, status, description, validated_by, validated_at, payment_date, completed_at, recorded_by)
        VALUES (:org, :tid, :ref, :mid, :amount, :method, 'success', :desc, :by, NOW(), NOW(), NOW(), :by)
        RETURNING id
    """), {
        "org": ctx["organization_id"],
        "tid": ctx["tontine_id"],
        "ref": reference,
        "mid": penalite["member_id"],
        "amount": montant,
        "method": methode,
        "desc": f"Pénalité: {penalite['reason']}",
        "by": enregistre_par,
    })).scalar()


async def mettre_a_jour_paiement_penalite(
    db: AsyncSession,
    penalite_id: int,
    montant_paye: float,
    statut: str,
) -> None:
    await db.execute(text("""
        UPDATE penalties SET paid_amount = :paid, status = :status, updated_at = NOW()
        WHERE id = :id
    """), {"paid": montant_paye, "status": statut, "id": penalite_id})


async def annuler_penalite(db: AsyncSession, penalite_id: int, raison: str):
    return (await db.execute(text("""
        UPDATE penalties SET status = 'cancelled', cancellation_reason = :reason, updated_at = NOW()
        WHERE id = :id
        RETURNING id
    """), {"id": penalite_id, "reason": raison})).mappings().one_or_none()

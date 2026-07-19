from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.sanctions.schema import CreationSanction


async def lister_sanctions(
    db: AsyncSession,
    statut: str | None,
    user_id: int,
    membre_uniquement: bool,
):
    return (await db.execute(text(f"""
        SELECT s.id, s.member_id AS mid, CONCAT(u.first_name, ' ', u.last_name) AS name,
               s.type, s.status, s.reason, s.fine_amount AS fine, s.start_date AS date,
               s.created_at, s.rejection_reason
        FROM sanctions s
        JOIN members m ON m.id = s.member_id
        JOIN public.users u ON u.id = m.user_id
        WHERE (CAST(:status AS VARCHAR) IS NULL OR s.status = :status)
          AND ({'m.user_id = :uid' if membre_uniquement else 'TRUE'})
        ORDER BY s.created_at DESC
    """), {"status": statut, "uid": user_id})).mappings().all()


async def creer_sanction(db: AsyncSession, ctx: dict, req: CreationSanction, propose_par: int):
    return (await db.execute(text("""
        INSERT INTO sanctions (organization_id, tontine_id, member_id, type, reason, fine_amount, start_date, status, proposed_by)
        VALUES (:org, :tid, :mid, :type, :reason, :fine, :start, 'pending_president', :by)
        RETURNING id, member_id AS mid, type, status, reason, fine_amount AS fine, start_date AS date
    """), {
        "org": ctx["organization_id"],
        "tid": ctx["tontine_id"],
        "mid": req.member_id,
        "type": req.type,
        "reason": req.reason,
        "fine": req.fine,
        "start": req.start_date,
        "by": propose_par,
    })).mappings().one()


async def obtenir_sanction(db: AsyncSession, sanction_id: int):
    return (await db.execute(text(
        "SELECT * FROM sanctions WHERE id = :id"
    ), {"id": sanction_id})).mappings().one_or_none()


async def changer_statut_sanction(
    db: AsyncSession,
    sanction_id: int,
    statut: str,
    valide_par: int,
    raison_rejet: str | None,
) -> None:
    await db.execute(text("""
        UPDATE sanctions
        SET status = :status, validated_by = :by, validated_at = NOW(), rejection_reason = :reason
        WHERE id = :id
    """), {
        "status": statut,
        "by": valide_par,
        "reason": raison_rejet,
        "id": sanction_id,
    })


async def creer_penalite_depuis_sanction(db: AsyncSession, ctx: dict, sanction, cree_par: int) -> None:
    await db.execute(text("""
        INSERT INTO penalties (organization_id, tontine_id, member_id, reason, amount, status, due_date, created_by)
        VALUES (:org, :tid, :mid, :reason, :amount, 'unpaid', CURRENT_DATE + 7, :by)
    """), {
        "org": ctx["organization_id"],
        "tid": ctx["tontine_id"],
        "mid": sanction["member_id"],
        "reason": sanction["reason"],
        "amount": sanction["fine_amount"],
        "by": cree_par,
    })


async def lever_sanction(db: AsyncSession, sanction_id: int, raison: str, levee_par: int) -> None:
    await db.execute(text("""
        UPDATE sanctions SET status = 'lifted', lift_reason = :reason, lifted_by = :by, lifted_at = NOW()
        WHERE id = :id
    """), {"reason": raison, "by": levee_par, "id": sanction_id})

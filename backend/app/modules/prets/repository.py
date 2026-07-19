from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.prets.schema import CreationPret


async def lister_prets(
    db: AsyncSession,
    statut: str | None,
    user_id: int,
    membre_uniquement: bool,
):
    return (await db.execute(text(f"""
        SELECT l.id, l.member_id AS mid, CONCAT(u.first_name, ' ', u.last_name) AS name,
               l.amount, l.amount AS requested_amount, l.amount AS approved_amount,
               l.interest_rate AS rate, l.interest_rate,
               l.duration_months AS months, l.duration_months,
               l.total_due AS total_to_repay, l.remaining_amount,
               l.amount_paid AS paid, l.status, l.start_date AS start, l.purpose,
               l.approved_at, l.disbursed_at, l.created_at
        FROM loans l
        JOIN members m ON m.id = l.member_id
        JOIN public.users u ON u.id = m.user_id
        WHERE (CAST(:status AS VARCHAR) IS NULL OR l.status = :status)
          AND ({'m.user_id = :uid' if membre_uniquement else 'TRUE'})
        ORDER BY l.created_at DESC
    """), {"status": statut, "uid": user_id})).mappings().all()


async def verifier_membre_proprietaire(db: AsyncSession, member_id: int, user_id: int):
    return (await db.execute(text(
        "SELECT id FROM members WHERE id = :mid AND user_id = :uid"
    ), {"mid": member_id, "uid": user_id})).scalar()


async def creer_pret(
    db: AsyncSession,
    ctx: dict,
    req: CreationPret,
    amount: float,
    months: int,
    details: dict,
):
    return (await db.execute(text("""
        INSERT INTO loans (organization_id, tontine_id, member_id, amount, interest_rate, duration_months,
                           total_interest, total_due, monthly_payment, amount_paid, remaining_amount, status, purpose)
        VALUES (:org, :tid, :mid, :amount, :rate, :months, :interest, :total, :monthly, 0, :total, 'pending', :purpose)
        RETURNING id
    """), {
        "org": ctx["organization_id"],
        "tid": ctx["tontine_id"],
        "mid": req.member_id,
        "amount": amount,
        "rate": req.interest_rate,
        "months": months,
        "interest": details["total_interest"],
        "total": details["total_due"],
        "monthly": details["monthly_payment"],
        "purpose": req.purpose,
    })).mappings().one()


async def obtenir_pret(db: AsyncSession, pret_id: int):
    return (await db.execute(text(
        "SELECT * FROM loans WHERE id = :id"
    ), {"id": pret_id})).mappings().one_or_none()


async def approuver_pret(db: AsyncSession, pret_id: int, approuve_par: int) -> None:
    await db.execute(text("""
        UPDATE loans
        SET status = 'active', approved_by = :by, approved_at = NOW(), disbursed_at = NOW(),
            start_date = CURRENT_DATE, remaining_amount = total_due, updated_at = NOW()
        WHERE id = :id
    """), {"by": approuve_par, "id": pret_id})


async def rejeter_pret(db: AsyncSession, pret_id: int) -> None:
    await db.execute(text(
        "UPDATE loans SET status = 'rejected', updated_at = NOW() WHERE id = :id"
    ), {"id": pret_id})


async def enregistrer_remboursement(
    db: AsyncSession,
    ctx: dict,
    pret,
    pret_id: int,
    montant: float,
    methode: str,
    enregistre_par: int,
) -> None:
    await db.execute(text("""
        INSERT INTO loan_repayments (organization_id, loan_id, member_id, amount, payment_method, recorded_by)
        VALUES (:org, :loan, :mid, :amount, :method, :by)
    """), {
        "org": ctx["organization_id"],
        "loan": pret_id,
        "mid": pret["member_id"],
        "amount": montant,
        "method": methode,
        "by": enregistre_par,
    })


async def mettre_a_jour_remboursement(
    db: AsyncSession,
    pret_id: int,
    montant_paye: float,
    restant: float,
    statut: str,
) -> None:
    await db.execute(text("""
        UPDATE loans SET amount_paid = :paid, remaining_amount = :remaining, status = :status, updated_at = NOW()
        WHERE id = :id
    """), {"paid": montant_paye, "remaining": restant, "status": statut, "id": pret_id})

from datetime import date, timedelta

from fastapi import HTTPException

from app.common.audit import audit
from app.common.cash import add_cash_movement, lock_cash_balance
from app.common.formatting import clean_rows
from app.common.idempotency import idempotency_lookup, idempotency_store
from app.common.notifications import create_notification
from app.common.payments import normalize_method
from app.modules.prets import repository
from app.modules.prets.schema import CreationPret, RemboursementPret
from app.core.database import get_tenant_db
from app.common.finance import calc_loan
from app.core.models import UserRole


def calculer_pret(req: dict):
    amount = float(req.get("amount") or req.get("requested_amount") or 0)
    rate = float(req.get("interest_rate") or 5)
    months = int(req.get("months") or req.get("duration_months") or 1)
    return calc_loan(amount, rate, months)


async def lister_prets(ctx: dict, current_user: dict, statut: str | None):
    db = await get_tenant_db(ctx["schema_name"])
    try:
        membre_uniquement = current_user.get("role") == UserRole.MEMBRE.value
        rows = await repository.lister_prets(
            db,
            statut,
            int(current_user["sub"]),
            membre_uniquement,
        )
        return clean_rows(rows)
    finally:
        await db.close()


async def creer_pret(ctx: dict, req: CreationPret, current_user: dict):
    amount = float(req.amount or req.requested_amount or 0)
    months = int(req.months or req.duration_months or 1)
    if amount <= 0:
        raise HTTPException(422, "Montant invalide")
    details = calc_loan(amount, req.interest_rate, months)
    db = await get_tenant_db(ctx["schema_name"])
    try:
        if current_user.get("role") == UserRole.MEMBRE.value:
            own = await repository.verifier_membre_proprietaire(
                db,
                req.member_id,
                int(current_user["sub"]),
            )
            if not own:
                raise HTTPException(403, "Un membre ne peut demander un prêt que pour lui-même")
        row = await repository.creer_pret(db, ctx, req, amount, months, details)
        await db.commit()
    finally:
        await db.close()
    await audit(current_user, "CREATE_LOAN", "loan", row["id"], {"amount": amount})
    return {"id": row["id"], "status": "pending", **details}


async def obtenir_pret(ctx: dict, current_user: dict, pret_id: int):
    prets = await lister_prets(ctx, current_user, None)
    for pret in prets:
        if int(pret["id"]) == pret_id:
            return pret
    raise HTTPException(404, "Prêt introuvable")


async def echeancier_pret(ctx: dict, current_user: dict, pret_id: int):
    pret = await obtenir_pret(ctx, current_user, pret_id)
    months = max(1, int(pret.get("months") or 1))
    monthly = float(pret.get("total_to_repay") or 0) / months
    paid = float(pret.get("paid") or 0)
    start_raw = pret.get("start") or pret.get("created_at")
    try:
        start_date = date.fromisoformat(str(start_raw)[:10]) if start_raw else date.today()
    except ValueError:
        start_date = date.today()
    schedule = []
    for i in range(months):
        due = start_date + timedelta(days=30 * i)
        installment_paid = min(max(paid - monthly * i, 0), monthly)
        status_value = "paid" if installment_paid >= monthly else "partial" if installment_paid > 0 else "pending"
        schedule.append({
            "num": i + 1,
            "no": i + 1,
            "due_date": due.isoformat(),
            "amount": round(monthly),
            "paid": round(installment_paid),
            "status": status_value,
        })
    return schedule


async def approuver_pret(ctx: dict, pret_id: int, current_user: dict):
    db = await get_tenant_db(ctx["schema_name"])
    try:
        pret = await repository.obtenir_pret(db, pret_id)
        if not pret:
            raise HTTPException(404, "Prêt introuvable")
        balance = await lock_cash_balance(db)
        if balance < float(pret["amount"]):
            raise HTTPException(409, "Solde de caisse insuffisant pour décaisser ce prêt")
        await repository.approuver_pret(db, pret_id, int(current_user["sub"]))
        await add_cash_movement(
            db,
            ctx["organization_id"],
            ctx["tontine_id"],
            "expense",
            "loan",
            float(pret["amount"]),
            "Décaissement prêt interne",
            "loan",
            pret_id,
            int(current_user["sub"]),
        )
        await create_notification(
            db,
            int(pret["member_id"]),
            "Prêt validé",
            "Votre prêt interne a été validé et décaissé.",
            "loan_approved",
            "/member/loans",
        )
        await db.commit()
    finally:
        await db.close()
    await audit(current_user, "APPROVE_LOAN", "loan", pret_id)
    return {"loan_id": pret_id, "status": "active"}


async def rejeter_pret(ctx: dict, pret_id: int):
    db = await get_tenant_db(ctx["schema_name"])
    try:
        await repository.rejeter_pret(db, pret_id)
        await db.commit()
    finally:
        await db.close()
    return {"loan_id": pret_id, "status": "rejected"}


async def rembourser_pret(
    ctx: dict,
    pret_id: int,
    amount: float | None,
    req: RemboursementPret | None,
    current_user: dict,
    idempotency_key: str | None,
):
    montant = float(amount if amount is not None else (req.amount if req else 0))
    if montant <= 0:
        raise HTTPException(422, "Montant invalide")
    methode = normalize_method(req.payment_method if req else "especes")
    db = await get_tenant_db(ctx["schema_name"])
    try:
        cached = await idempotency_lookup(db, idempotency_key, "repay_loan")
        if cached:
            return cached
        pret = await repository.obtenir_pret(db, pret_id)
        if not pret:
            raise HTTPException(404, "Prêt introuvable")
        paid = float(pret["amount_paid"] or 0) + montant
        remaining = max(0, float(pret["total_due"] or 0) - paid)
        status_value = "paid" if remaining <= 0 else "active"
        await repository.enregistrer_remboursement(
            db,
            ctx,
            pret,
            pret_id,
            montant,
            methode,
            int(current_user["sub"]),
        )
        await repository.mettre_a_jour_remboursement(db, pret_id, paid, remaining, status_value)
        await add_cash_movement(
            db,
            ctx["organization_id"],
            ctx["tontine_id"],
            "income",
            "loan_repayment",
            montant,
            "Remboursement prêt",
            "loan",
            pret_id,
            int(current_user["sub"]),
        )
        result = {"id": pret_id, "paid": paid, "remaining_amount": remaining, "status": status_value}
        await idempotency_store(db, idempotency_key, "repay_loan", result)
        await db.commit()
    finally:
        await db.close()
    return result

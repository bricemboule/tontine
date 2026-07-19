import uuid

from fastapi import HTTPException

from app.common.audit import audit
from app.common.cash import add_cash_movement
from app.common.formatting import clean_row, clean_rows
from app.common.idempotency import idempotency_lookup, idempotency_store
from app.common.notifications import create_notification
from app.common.payments import normalize_method
from app.common.receipts import create_receipt
from app.modules.penalites import repository
from app.modules.penalites.schema import AnnulationPenalite, CreationPenalite, PaiementPenalite
from app.core.database import get_tenant_db
from app.core.models import UserRole


async def lister_penalites(ctx: dict, current_user: dict, statut: str | None):
    db = await get_tenant_db(ctx["schema_name"])
    try:
        membre_uniquement = current_user.get("role") == UserRole.MEMBRE.value
        rows = await repository.lister_penalites(
            db,
            statut,
            int(current_user["sub"]),
            membre_uniquement,
        )
        return clean_rows(rows)
    finally:
        await db.close()


async def creer_penalite(ctx: dict, req: CreationPenalite, current_user: dict):
    db = await get_tenant_db(ctx["schema_name"])
    try:
        row = await repository.creer_penalite(db, ctx, req, int(current_user["sub"]))
        await create_notification(
            db,
            req.member_id,
            "Pénalité ajoutée",
            req.reason,
            "penalty_added",
            "/member/penalties",
        )
        await db.commit()
    finally:
        await db.close()
    await audit(current_user, "ADD_PENALTY", "penalty", row["id"], {"amount": req.amount})
    return clean_row(row)


async def payer_penalite(
    ctx: dict,
    penalite_id: int,
    req: PaiementPenalite,
    current_user: dict,
    idempotency_key: str | None,
):
    methode = normalize_method(req.payment_method)
    db = await get_tenant_db(ctx["schema_name"])
    try:
        cached = await idempotency_lookup(db, idempotency_key, "pay_penalty")
        if cached:
            return cached
        penalite = await repository.obtenir_penalite(db, penalite_id)
        if not penalite:
            raise HTTPException(404, "Pénalité introuvable")
        montant_paye = float(penalite["paid_amount"] or 0) + req.amount
        statut = "paid" if montant_paye >= float(penalite["amount"]) else "partial"
        reference = f"TOS-PEN-{uuid.uuid4().hex[:8].upper()}"
        paiement_id = await repository.creer_paiement_penalite(
            db,
            ctx,
            penalite,
            req.amount,
            methode,
            reference,
            int(current_user["sub"]),
        )
        await repository.mettre_a_jour_paiement_penalite(db, penalite_id, montant_paye, statut)
        await add_cash_movement(
            db,
            ctx["organization_id"],
            ctx["tontine_id"],
            "income",
            "penalty",
            req.amount,
            penalite["reason"],
            "penalty",
            penalite_id,
            int(current_user["sub"]),
        )
        await create_receipt(
            db,
            ctx["organization_id"],
            ctx["tontine_id"],
            int(penalite["member_id"]),
            paiement_id,
            "penalty",
            req.amount,
            methode,
            reference,
            int(current_user["sub"]),
        )
        result = {"penalty_id": penalite_id, "status": statut}
        await idempotency_store(db, idempotency_key, "pay_penalty", result)
        await db.commit()
    finally:
        await db.close()
    return result


async def annuler_penalite(ctx: dict, penalite_id: int, req: AnnulationPenalite):
    db = await get_tenant_db(ctx["schema_name"])
    try:
        row = await repository.annuler_penalite(db, penalite_id, req.reason)
        if not row:
            raise HTTPException(404, "Pénalité introuvable")
        await db.commit()
    finally:
        await db.close()
    return {"penalty_id": penalite_id, "status": "cancelled"}

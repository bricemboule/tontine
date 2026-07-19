from fastapi import HTTPException

from app.common.audit import audit
from app.common.cash import add_cash_movement, lock_cash_balance
from app.common.formatting import clean_row, clean_rows
from app.modules.decaissements import repository
from app.modules.decaissements.schema import CreationDecaissement, DecisionDecaissement
from app.core.database import get_tenant_db


async def lister_decaissements(ctx: dict):
    db = await get_tenant_db(ctx["schema_name"])
    try:
        rows = await repository.lister_decaissements(db)
        return clean_rows(rows)
    finally:
        await db.close()


async def creer_decaissement(ctx: dict, req: CreationDecaissement, current_user: dict):
    db = await get_tenant_db(ctx["schema_name"])
    try:
        row = await repository.creer_decaissement(db, ctx, req, int(current_user["sub"]))
        await db.commit()
    finally:
        await db.close()
    return clean_row(row)


async def approuver_decaissement(ctx: dict, decaissement_id: int, current_user: dict):
    db = await get_tenant_db(ctx["schema_name"])
    try:
        decaissement = await repository.obtenir_decaissement(db, decaissement_id)
        if not decaissement:
            raise HTTPException(404, "Décaissement introuvable")
        if decaissement["status"] == "paid":
            return {"payout_id": decaissement_id, "status": "paid"}
        balance = await lock_cash_balance(db)
        if balance < float(decaissement["amount"]):
            raise HTTPException(409, "Solde de caisse insuffisant")
        await repository.marquer_decaissement_paye(db, decaissement_id, int(current_user["sub"]))
        await add_cash_movement(
            db,
            ctx["organization_id"],
            ctx["tontine_id"],
            "expense",
            "payout",
            float(decaissement["amount"]),
            decaissement["reason"],
            "payout",
            decaissement_id,
            int(current_user["sub"]),
        )
        if decaissement["payout_turn_id"]:
            await repository.marquer_tour_decaissement_paye(db, int(decaissement["payout_turn_id"]))
        await db.commit()
    finally:
        await db.close()
    await audit(current_user, "APPROVE_PAYOUT", "payout", decaissement_id)
    return {"payout_id": decaissement_id, "status": "paid"}


async def rejeter_decaissement(ctx: dict, decaissement_id: int, req: DecisionDecaissement):
    db = await get_tenant_db(ctx["schema_name"])
    try:
        await repository.rejeter_decaissement(db, decaissement_id)
        await db.commit()
    finally:
        await db.close()
    return {"payout_id": decaissement_id, "status": "rejected", "reason": req.reason}

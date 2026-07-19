from fastapi import HTTPException

from app.common.audit import audit
from app.common.cash import add_cash_movement, lock_cash_balance
from app.common.formatting import clean_rows
from app.modules.tours import repository
from app.core.database import get_tenant_db


async def lister_tours(ctx: dict):
    db = await get_tenant_db(ctx["schema_name"])
    try:
        rows = await repository.lister_tours(db)
        return clean_rows(rows)
    finally:
        await db.close()


async def generer_tours(ctx: dict, melanger: bool, current_user: dict):
    db = await get_tenant_db(ctx["schema_name"])
    try:
        await repository.regenerer_tours(db, melanger)
        await db.commit()
        rows = await repository.lister_tours_apres_generation(db)
    finally:
        await db.close()
    await audit(current_user, "GENERATE_PAYOUT_TURNS", "tour", ctx["tontine_id"])
    return clean_rows(rows)


async def payer_tour(ctx: dict, tour_id: int, current_user: dict):
    db = await get_tenant_db(ctx["schema_name"])
    try:
        tour = await repository.obtenir_tour(db, tour_id)
        if not tour:
            raise HTTPException(404, "Tour introuvable")
        balance = await lock_cash_balance(db)
        montant = float(tour["amount_received"] or 0)
        if montant <= 0:
            raise HTTPException(422, "Montant du tour non défini — renseignez le montant à verser avant de payer")
        if balance < montant:
            raise HTTPException(409, "Solde de caisse insuffisant")
        await repository.marquer_tour_paye(db, tour_id, montant)
        await add_cash_movement(
            db,
            ctx["organization_id"],
            ctx["tontine_id"],
            "expense",
            "payout",
            montant,
            "Tour de passage payé",
            "tour",
            tour_id,
            int(current_user["sub"]),
        )
        await db.commit()
    finally:
        await db.close()
    return {"tour_id": tour_id, "status": "completed"}

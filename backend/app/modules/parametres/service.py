from fastapi import HTTPException

from app.common.audit import audit
from app.common.formatting import clean_row
from app.modules.parametres import repository
from app.modules.parametres.schema import ModificationParametres
from app.core.database import get_tenant_db

CHAMPS_CONFIG_MODIFIABLES = {
    "name",
    "description",
    "type",
    "frequency",
    "cotisation_amount",
    "max_members",
    "loan_interest_rate",
    "penalty_rate",
    "grace_days",
}


async def obtenir_parametres(ctx: dict) -> dict:
    db = await get_tenant_db(ctx["schema_name"])
    try:
        row = await repository.obtenir_config(db, ctx["schema_name"])
        return clean_row(row) if row else {"schema": ctx["schema_name"], "name": ctx["tontine_name"]}
    finally:
        await db.close()


async def modifier_parametres(ctx: dict, req: ModificationParametres, current_user: dict) -> dict:
    updates = req.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(422, "Aucune donnée à mettre à jour")

    allowed_updates = {
        key: value for key, value in updates.items()
        if key in CHAMPS_CONFIG_MODIFIABLES
    }
    if not allowed_updates:
        raise HTTPException(422, "Aucune donnée autorisée à mettre à jour")

    db = await get_tenant_db(ctx["schema_name"])
    try:
        await repository.modifier_config(db, allowed_updates)
        await db.commit()
    finally:
        await db.close()

    await audit(current_user, "UPDATE_CONFIG", "config", ctx["tontine_id"], allowed_updates)
    return {"message": "Configuration mise à jour", **allowed_updates}

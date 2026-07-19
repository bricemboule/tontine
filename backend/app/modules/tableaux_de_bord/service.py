from fastapi import HTTPException

from app.common.formatting import clean_row
from app.modules.tableaux_de_bord import repository
from app.core.database import get_tenant_db


async def tableau_admin(ctx: dict):
    db = await get_tenant_db(ctx["schema_name"])
    try:
        row = await repository.statistiques_admin(db)
        next_turn = await repository.prochain_beneficiaire(db)
        data = clean_row(row)
        data["next_beneficiary"] = clean_row(next_turn) if next_turn else None
        return data
    finally:
        await db.close()


async def tableau_membre(ctx: dict, current_user: dict):
    db = await get_tenant_db(ctx["schema_name"])
    try:
        member_id = await repository.membre_par_utilisateur(db, int(current_user["sub"]))
        if not member_id:
            raise HTTPException(404, "Profil membre introuvable")
        row = await repository.statistiques_membre(db, member_id)
        return clean_row(row)
    finally:
        await db.close()

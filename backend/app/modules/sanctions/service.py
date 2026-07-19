from fastapi import HTTPException

from app.common.audit import audit
from app.common.formatting import clean_row, clean_rows
from app.modules.sanctions import repository
from app.modules.sanctions.schema import CreationSanction, ValidationSanction
from app.core.database import get_tenant_db
from app.core.models import UserRole


async def lister_sanctions(ctx: dict, current_user: dict, statut: str | None):
    db = await get_tenant_db(ctx["schema_name"])
    try:
        membre_uniquement = current_user.get("role") == UserRole.MEMBRE.value
        rows = await repository.lister_sanctions(
            db,
            statut,
            int(current_user["sub"]),
            membre_uniquement,
        )
        return clean_rows(rows)
    finally:
        await db.close()


async def proposer_sanction(ctx: dict, req: CreationSanction, current_user: dict):
    db = await get_tenant_db(ctx["schema_name"])
    try:
        row = await repository.creer_sanction(db, ctx, req, int(current_user["sub"]))
        await db.commit()
    finally:
        await db.close()
    await audit(current_user, "ADD_SANCTION", "sanction", row["id"], {"fine": req.fine})
    return clean_row(row)


async def valider_sanction(ctx: dict, sanction_id: int, req: ValidationSanction, current_user: dict):
    nouveau_statut = "active" if req.action == "approve" else "rejected"
    db = await get_tenant_db(ctx["schema_name"])
    try:
        sanction = await repository.obtenir_sanction(db, sanction_id)
        if not sanction:
            raise HTTPException(404, "Sanction introuvable")
        await repository.changer_statut_sanction(
            db,
            sanction_id,
            nouveau_statut,
            int(current_user["sub"]),
            req.rejection_reason,
        )
        if nouveau_statut == "active" and float(sanction["fine_amount"] or 0) > 0:
            await repository.creer_penalite_depuis_sanction(
                db,
                ctx,
                sanction,
                int(current_user["sub"]),
            )
        await db.commit()
    finally:
        await db.close()
    await audit(current_user, "VALIDATE_SANCTION", "sanction", sanction_id, {"status": nouveau_statut})
    return {"sanction_id": sanction_id, "status": nouveau_statut}


async def lever_sanction(ctx: dict, sanction_id: int, raison: str, current_user: dict):
    db = await get_tenant_db(ctx["schema_name"])
    try:
        await repository.lever_sanction(db, sanction_id, raison, int(current_user["sub"]))
        await db.commit()
    finally:
        await db.close()
    return {"sanction_id": sanction_id, "status": "lifted"}

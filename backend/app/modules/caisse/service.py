from app.common.formatting import clean_row, clean_rows
from app.modules.caisse import repository
from app.core.database import get_tenant_db


async def tableau_caisse(ctx: dict):
    db = await get_tenant_db(ctx["schema_name"])
    try:
        rows = await repository.lister_mouvements_caisse(db)
        totals = await repository.totaux_caisse(db)
        return {"totals": clean_row(totals), "movements": clean_rows(rows)}
    finally:
        await db.close()


async def mouvements_caisse(
    ctx: dict,
    movement_type: str | None,
    category: str | None,
    page: int,
    limit: int,
):
    db = await get_tenant_db(ctx["schema_name"])
    try:
        rows = await repository.mouvements_caisse_pages(
            db,
            movement_type,
            category,
            page,
            limit,
        )
        return clean_rows(rows)
    finally:
        await db.close()

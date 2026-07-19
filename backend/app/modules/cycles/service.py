from fastapi import HTTPException

from app.common.audit import audit
from app.common.formatting import clean_row, clean_rows
from app.modules.cycles import repository
from app.modules.cycles.schema import CreationCycle
from app.core.database import get_tenant_db


async def lister_cycles(ctx: dict) -> list[dict]:
    db = await get_tenant_db(ctx["schema_name"])
    try:
        return clean_rows(await repository.lister_cycles(db))
    finally:
        await db.close()


async def creer_cycle(ctx: dict, req: CreationCycle, current_user: dict) -> dict:
    db = await get_tenant_db(ctx["schema_name"])
    try:
        row = await repository.creer_cycle(db, {
            "org": ctx["organization_id"],
            "tid": ctx["tontine_id"],
            "name": req.name,
            "start": req.start_date,
            "end": req.end_date,
            "expected": req.expected_total_amount,
        })
        await db.commit()
    finally:
        await db.close()
    await audit(current_user, "CREATE_CYCLE", "cycle", row["id"])
    return clean_row(row)


async def activer_cycle(ctx: dict, cycle_id: int) -> dict:
    db = await get_tenant_db(ctx["schema_name"])
    try:
        await repository.terminer_cycles_actifs(db)
        row = await repository.activer_cycle(db, cycle_id)
        if not row:
            raise HTTPException(404, "Cycle introuvable")
        await db.commit()
    finally:
        await db.close()
    return clean_row(row)


async def cloturer_cycle(ctx: dict, cycle_id: int) -> dict:
    db = await get_tenant_db(ctx["schema_name"])
    try:
        row = await repository.cloturer_cycle(db, cycle_id)
        if not row:
            raise HTTPException(404, "Cycle introuvable")
        await db.commit()
    finally:
        await db.close()
    return clean_row(row)

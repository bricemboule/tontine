from app.common.formatting import clean_rows
from app.modules.notifications import repository
from app.core.database import get_tenant_db
from app.core.models import UserRole


async def lister_notifications(ctx: dict, current_user: dict):
    db = await get_tenant_db(ctx["schema_name"])
    try:
        member_id = await repository.membre_par_utilisateur(db, int(current_user["sub"]))
        if not member_id and current_user.get("role") != UserRole.SUPERADMIN.value:
            return []
        rows = await repository.lister_notifications(db, member_id)
        return clean_rows(rows)
    finally:
        await db.close()


async def marquer_notification_lue(ctx: dict, notif_id: int):
    db = await get_tenant_db(ctx["schema_name"])
    try:
        await repository.marquer_notification_lue(db, notif_id)
        await db.commit()
    finally:
        await db.close()
    return {"notif_id": notif_id, "read": True}


async def marquer_toutes_lues(ctx: dict, current_user: dict):
    db = await get_tenant_db(ctx["schema_name"])
    try:
        member_id = await repository.membre_par_utilisateur(db, int(current_user["sub"]))
        await repository.marquer_toutes_lues(db, member_id)
        await db.commit()
    finally:
        await db.close()
    return {"message": "Tout marqué comme lu"}

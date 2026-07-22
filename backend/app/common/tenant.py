from fastapi import HTTPException
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.formatting import clean_row
from app.core.models import UserRole


async def tenant_context(current_user: dict, db: AsyncSession) -> dict:
    schema = current_user.get("schema")
    if not schema:
        raise HTTPException(
            403,
            "Aucune tontine active dans votre session. Déconnectez-vous puis "
            "reconnectez-vous. Si le problème persiste, demandez au superadmin "
            "de vous affecter à une tontine.",
        )

    row = (await db.execute(text("""
        SELECT tr.id AS tontine_id, tr.name AS tontine_name, tr.slug, tr.schema_name,
               tr.organization_id, o.name AS organization_name, o.status AS organization_status,
               (SELECT tm.status FROM tontine_members tm
                  WHERE tm.user_id = :uid AND tm.tontine_id = tr.id) AS member_status,
               EXISTS(SELECT 1 FROM tontine_admin_assignments ta
                  WHERE ta.user_id = :uid AND ta.tontine_id = tr.id) AS is_admin
        FROM tontine_registry tr
        LEFT JOIN organizations o ON o.id = tr.organization_id
        WHERE tr.schema_name = :schema
    """), {"schema": schema, "uid": int(current_user["sub"])})).mappings().one_or_none()
    if not row:
        raise HTTPException(403, "Tontine introuvable")

    ctx = clean_row(row)
    is_superadmin = current_user.get("role") == UserRole.SUPERADMIN.value
    if not is_superadmin and not ctx.get("is_admin") and ctx.get("member_status") != "active":
        raise HTTPException(403, "Vous n'êtes pas membre actif de cette tontine")
    if ctx.get("organization_status") == "suspended" and not is_superadmin:
        raise HTTPException(403, "Organisation suspendue")

    ctx.pop("member_status", None)
    ctx.pop("is_admin", None)
    return ctx


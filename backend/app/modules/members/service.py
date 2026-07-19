import uuid

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.audit import audit
from app.common.formatting import clean_row, clean_rows
from app.modules.members import repository
from app.modules.members.schema import MemberCreate, MemberUpdate, OffboardMember
from app.core.database import get_tenant_db
from app.core.models import UserRole
from app.core.security import generate_temporary_password, hash_password


def require_action(value: str, allowed: set[str]) -> str:
    if value not in allowed:
        raise HTTPException(400, f"Action invalide: {value}")
    return value


async def list_members(
    ctx: dict,
    current_user: dict,
    member_status: str | None,
    search: str | None,
) -> list[dict]:
    db = await get_tenant_db(ctx["schema_name"])
    try:
        await repository.normalize_member_cotisation_statuses(db)
        rows = await repository.list_members(
            db,
            user_id=int(current_user["sub"]),
            member_only=current_user.get("role") == UserRole.MEMBRE.value,
            member_status=member_status,
            search=search,
        )
        return clean_rows(rows)
    finally:
        await db.close()


async def create_member(
    ctx: dict,
    req: MemberCreate,
    current_user: dict,
    central: AsyncSession,
) -> dict:
    email = (req.email or "").strip() or f"member-{uuid.uuid4().hex[:8]}@tontine.local"
    phone = req.phone.strip()
    temporary_password = None

    existing = await repository.find_user_by_email_or_phone(central, email, phone)
    if existing:
        user_id = int(existing)
        await repository.update_existing_user(central, user_id, req)
    else:
        temporary_password = generate_temporary_password()
        user_id = await repository.create_user(
            central,
            req,
            email=email,
            phone=phone,
            hashed_password=hash_password(temporary_password),
        )

    await repository.upsert_central_membership(central, ctx, user_id, req.role.value)
    await central.commit()

    db = await get_tenant_db(ctx["schema_name"])
    try:
        row = await repository.upsert_tenant_member(db, ctx, user_id, req)
        await db.commit()
    finally:
        await db.close()

    await audit(current_user, "ADD_MEMBER", "member", row["id"], {"email": email, "role": req.role.value})
    return {
        "id": row["id"],
        "name": f"{req.first_name} {req.last_name}",
        "first_name": req.first_name,
        "last_name": req.last_name,
        "email": email if not email.endswith("@tontine.local") else None,
        "phone": phone,
        "role": req.role.value,
        "status": row["status"],
        "joined": None,
        "cp": 0,
        "ct": 0,
        "temporary_password": temporary_password,
    }


async def get_member(ctx: dict, current_user: dict, member_id: int) -> dict:
    db = await get_tenant_db(ctx["schema_name"])
    try:
        row = await repository.get_member(
            db,
            member_id,
            user_id=int(current_user["sub"]),
            member_only=current_user.get("role") == UserRole.MEMBRE.value,
        )
        if not row:
            raise HTTPException(404, "Membre introuvable")
        return clean_row(row)
    finally:
        await db.close()


async def update_member(
    ctx: dict,
    member_id: int,
    req: MemberUpdate,
    current_user: dict,
    central: AsyncSession,
) -> dict:
    db = await get_tenant_db(ctx["schema_name"])
    try:
        current = await repository.get_member_for_update(db, member_id)
        if not current:
            raise HTTPException(404, "Membre introuvable")

        await repository.update_user_fields(central, current["user_id"], req)
        await central.commit()
        await repository.update_member_fields(db, member_id, req)
        await db.commit()

        if req.role is not None or req.status is not None:
            await repository.update_central_member_role_status(central, ctx, current["user_id"], req)
            await central.commit()

        await audit(current_user, "UPDATE_MEMBER", "member", member_id, req.model_dump(exclude_unset=True))
        return {"id": member_id, "message": "Membre mis à jour"}
    finally:
        await db.close()


async def validate_member(
    ctx: dict,
    member_id: int,
    action: str,
    current_user: dict,
    central: AsyncSession,
) -> dict:
    require_action(action, {"approve", "reject"})
    new_status = "active" if action == "approve" else "excluded"
    db = await get_tenant_db(ctx["schema_name"])
    try:
        member = await repository.validate_member(db, member_id, new_status, int(current_user["sub"]))
        if not member:
            raise HTTPException(404, "Membre introuvable")
        await db.commit()
        await repository.update_central_member_status(central, ctx, member["user_id"], new_status)
        await central.commit()
    finally:
        await db.close()

    await audit(current_user, "VALIDATE_MEMBER", "member", member_id, {"status": new_status})
    return {"member_id": member_id, "status": new_status}


async def suspend_member(
    ctx: dict,
    member_id: int,
    current_user: dict,
    central: AsyncSession,
) -> dict:
    db = await get_tenant_db(ctx["schema_name"])
    try:
        member = await repository.suspend_member(db, member_id)
        if not member:
            raise HTTPException(404, "Membre introuvable")
        await db.commit()
        await repository.update_central_member_status(central, ctx, member["user_id"], "suspended")
        await central.commit()
    finally:
        await db.close()

    await audit(current_user, "SUSPEND_MEMBER", "member", member_id)
    return {"member_id": member_id, "status": "suspended"}


async def member_outstanding(db: AsyncSession, member_id: int) -> dict:
    return await repository.member_outstanding(db, member_id)


async def get_member_outstanding(ctx: dict, member_id: int) -> dict:
    db = await get_tenant_db(ctx["schema_name"])
    try:
        return await member_outstanding(db, member_id)
    finally:
        await db.close()


async def offboard_member(
    ctx: dict,
    member_id: int,
    req: OffboardMember,
    current_user: dict,
    central: AsyncSession,
) -> dict:
    db = await get_tenant_db(ctx["schema_name"])
    try:
        member = await repository.get_member_for_update(db, member_id)
        if not member:
            raise HTTPException(404, "Membre introuvable")
        if member["status"] == "excluded":
            raise HTTPException(409, "Membre déjà exclu")

        debt = await member_outstanding(db, member_id)
        if debt["total"] > 0 and not req.force:
            raise HTTPException(409, {
                "message": "Solde impayé — réglez-le ou forcez la sortie",
                "outstanding": debt,
            })

        await repository.mark_member_excluded(db, member_id)
        await repository.cancel_future_obligations(db, member_id)
        await repository.create_member_notification(
            db,
            member_id,
            "Sortie de la tontine",
            f"Votre participation a pris fin. {req.reason}",
            "member_offboarded",
            "/member",
        )
        await db.commit()
        await repository.update_central_member_status(central, ctx, member["user_id"], "excluded")
        await central.commit()
    finally:
        await db.close()

    await audit(
        current_user,
        "OFFBOARD_MEMBER",
        "member",
        member_id,
        {"reason": req.reason, "forced": req.force, "outstanding": debt},
    )
    return {"member_id": member_id, "status": "excluded", "outstanding": debt, "forced": req.force}


async def reinstate_member(
    ctx: dict,
    member_id: int,
    current_user: dict,
    central: AsyncSession,
) -> dict:
    db = await get_tenant_db(ctx["schema_name"])
    try:
        member = await repository.get_member_for_update(db, member_id)
        if not member:
            raise HTTPException(404, "Membre introuvable")
        if member["status"] == "active":
            raise HTTPException(409, "Membre déjà actif")

        await repository.reinstate_member(db, member_id)
        await repository.create_member_notification(
            db,
            member_id,
            "Réintégration",
            "Votre participation à la tontine a été réactivée.",
            "member_reinstated",
            "/member",
        )
        await db.commit()
        await repository.update_central_member_status(central, ctx, member["user_id"], "active")
        await central.commit()
    finally:
        await db.close()

    await audit(current_user, "REINSTATE_MEMBER", "member", member_id)
    return {"member_id": member_id, "status": "active"}


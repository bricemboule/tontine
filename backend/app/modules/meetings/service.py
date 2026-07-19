from fastapi import HTTPException

from app.common.audit import audit
from app.common.formatting import clean_row, clean_rows
from app.modules.meetings import repository
from app.modules.meetings.schema import MeetingClose, MeetingCreate
from app.core.database import get_tenant_db


async def list_meetings(ctx: dict) -> list[dict]:
    db = await get_tenant_db(ctx["schema_name"])
    try:
        return clean_rows(await repository.list_meetings(db))
    finally:
        await db.close()


async def create_meeting(ctx: dict, req: MeetingCreate, current_user: dict) -> dict:
    meeting_date = req.meeting_date or req.date
    if not meeting_date:
        raise HTTPException(422, "La date de réunion est requise")

    db = await get_tenant_db(ctx["schema_name"])
    try:
        row = await repository.create_meeting(
            db,
            ctx,
            req,
            meeting_date,
            int(current_user["sub"]),
        )
        await repository.notify_active_members(db, ctx["organization_id"], req.title, meeting_date)
        await db.commit()
    finally:
        await db.close()

    await audit(current_user, "CREATE_MEETING", "meeting", row["id"])
    return clean_row(row)


async def update_meeting(ctx: dict, meeting_id: int, req: MeetingCreate) -> dict:
    meeting_date = req.meeting_date or req.date
    db = await get_tenant_db(ctx["schema_name"])
    try:
        row = await repository.update_meeting(db, meeting_id, req, meeting_date)
        if not row:
            raise HTTPException(404, "Réunion introuvable")
        await db.commit()
    finally:
        await db.close()

    return clean_row(row)


async def close_meeting(ctx: dict, meeting_id: int, req: MeetingClose, current_user: dict) -> dict:
    db = await get_tenant_db(ctx["schema_name"])
    try:
        meeting = await repository.get_meeting(db, meeting_id)
        if not meeting:
            raise HTTPException(404, "Réunion introuvable")
        await repository.close_meeting(db, ctx, meeting_id, req, int(current_user["sub"]))
        await db.commit()
    finally:
        await db.close()

    await audit(current_user, "CLOSE_MEETING", "meeting", meeting_id, {"attendees": req.attendees})
    return {"meeting_id": meeting_id, "status": "done"}


async def cancel_meeting(ctx: dict, meeting_id: int) -> dict:
    db = await get_tenant_db(ctx["schema_name"])
    try:
        await repository.cancel_meeting(db, meeting_id)
        await db.commit()
    finally:
        await db.close()
    return {"meeting_id": meeting_id, "status": "cancelled"}


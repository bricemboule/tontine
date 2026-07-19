from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.meetings.schema import MeetingClose, MeetingCreate


async def list_meetings(db: AsyncSession):
    return (await db.execute(text("""
        SELECT mt.id, mt.title, mt.event_date AS date, mt.event_time AS time,
               mt.location, mt.agenda, mt.report, mt.status,
               mt.total_collected AS collected, mt.attendees_count AS attendees,
               (SELECT COUNT(*) FROM members WHERE status = 'active') AS total,
               COALESCE(CONCAT(u.first_name, ' ', u.last_name), '') AS beneficiary
        FROM meetings mt
        LEFT JOIN members bm ON bm.id = mt.beneficiary_id
        LEFT JOIN public.users u ON u.id = bm.user_id
        ORDER BY mt.event_date DESC
    """))).mappings().all()


async def create_meeting(
    db: AsyncSession,
    ctx: dict,
    req: MeetingCreate,
    meeting_date,
    created_by: int,
):
    return (await db.execute(text("""
        INSERT INTO meetings (organization_id, tontine_id, title, event_date, event_time, location, agenda, description, status, created_by)
        VALUES (:org, :tid, :title, :date, :time, :location, :agenda, :agenda, 'upcoming', :by)
        RETURNING id, title, event_date AS date, event_time AS time, location, status
    """), {
        "org": ctx["organization_id"],
        "tid": ctx["tontine_id"],
        "title": req.title,
        "date": meeting_date,
        "time": req.time,
        "location": req.location,
        "agenda": req.agenda,
        "by": created_by,
    })).mappings().one()


async def notify_active_members(db: AsyncSession, organization_id: int, title: str, meeting_date) -> None:
    await db.execute(text("""
        INSERT INTO notifications (organization_id, member_id, channel, subject, body, type, status, is_read, link)
        SELECT :org, id, 'app', 'Réunion programmée', :body, 'meeting_scheduled', 'sent', false, '/member/meetings'
        FROM members WHERE status = 'active'
    """), {"org": organization_id, "body": f"{title} le {meeting_date.isoformat()}"})


async def update_meeting(db: AsyncSession, meeting_id: int, req: MeetingCreate, meeting_date):
    return (await db.execute(text("""
        UPDATE meetings
        SET title = :title, event_date = :date, event_time = :time, location = :location,
            agenda = :agenda, updated_at = NOW()
        WHERE id = :id
        RETURNING id, title, event_date AS date, event_time AS time, location, status
    """), {
        "id": meeting_id,
        "title": req.title,
        "date": meeting_date,
        "time": req.time,
        "location": req.location,
        "agenda": req.agenda,
    })).mappings().one_or_none()


async def get_meeting(db: AsyncSession, meeting_id: int):
    return (await db.execute(
        text("SELECT * FROM meetings WHERE id = :id"),
        {"id": meeting_id},
    )).mappings().one_or_none()


async def close_meeting(
    db: AsyncSession,
    ctx: dict,
    meeting_id: int,
    req: MeetingClose,
    closed_by: int,
) -> None:
    await db.execute(text("""
        UPDATE meetings
        SET status = 'done', total_collected = :collected, attendees_count = :attendees,
            report = :report, updated_at = NOW()
        WHERE id = :id
    """), {
        "id": meeting_id,
        "collected": req.collected,
        "attendees": req.attendees,
        "report": req.report,
    })
    for member_id in req.absentees:
        await db.execute(text("""
            INSERT INTO meeting_attendances (meeting_id, member_id, status, penalty_amount)
            VALUES (:meeting, :member, 'absent', :penalty)
            ON CONFLICT (meeting_id, member_id) DO UPDATE SET status = 'absent', penalty_amount = EXCLUDED.penalty_amount
        """), {
            "meeting": meeting_id,
            "member": member_id,
            "penalty": req.absence_penalty,
        })
        if req.absence_penalty > 0:
            await db.execute(text("""
                INSERT INTO penalties (organization_id, tontine_id, member_id, reason, amount, status, due_date, created_by)
                VALUES (:org, :tid, :member, 'Absence à une réunion', :amount, 'unpaid', CURRENT_DATE + 7, :by)
            """), {
                "org": ctx["organization_id"],
                "tid": ctx["tontine_id"],
                "member": member_id,
                "amount": req.absence_penalty,
                "by": closed_by,
            })


async def cancel_meeting(db: AsyncSession, meeting_id: int) -> None:
    await db.execute(text(
        "UPDATE meetings SET status = 'cancelled', updated_at = NOW() WHERE id = :id"
    ), {"id": meeting_id})


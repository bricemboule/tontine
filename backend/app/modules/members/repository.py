from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.members.schema import MemberCreate, MemberUpdate


async def normalize_member_cotisation_statuses(db: AsyncSession) -> None:
    await db.execute(text("""
        UPDATE member_cotisations mc
        SET status = CASE
            WHEN amount_paid >= amount_due THEN 'paid'
            WHEN amount_paid > 0 THEN 'partial'
            ELSE status
        END
    """))


async def list_members(
    db: AsyncSession,
    *,
    user_id: int,
    member_only: bool,
    member_status: str | None,
    search: str | None,
):
    params = {
        "uid": user_id,
        "status": member_status,
        "search": f"%{(search or '').lower()}%",
    }
    return (await db.execute(text(f"""
        SELECT m.id,
               u.first_name, u.last_name,
               CONCAT(u.first_name, ' ', u.last_name) AS name,
               u.email, u.phone,
               m.photo, m.profession, m.address,
               m.role, m.status, m.joined_at AS joined,
               m.tour_order AS tour,
               COUNT(mc.id) AS ct,
               COUNT(mc.id) FILTER (WHERE mc.status = 'paid') AS cp,
               COALESCE(SUM(mc.amount_paid), 0) AS total_contributed,
               COALESCE((SELECT SUM(amount - paid_amount) FROM penalties p WHERE p.member_id = m.id AND p.status <> 'cancelled'), 0) AS total_penalties,
               COALESCE((SELECT SUM(remaining_amount) FROM loans l WHERE l.member_id = m.id AND l.status IN ('active','late')), 0) AS total_loans,
               COALESCE(SUM(mc.amount_paid), 0)
                 - COALESCE((SELECT SUM(amount - paid_amount) FROM penalties p WHERE p.member_id = m.id AND p.status <> 'cancelled'), 0)
                 - COALESCE((SELECT SUM(remaining_amount) FROM loans l WHERE l.member_id = m.id AND l.status IN ('active','late')), 0) AS balance
        FROM members m
        JOIN public.users u ON u.id = m.user_id
        LEFT JOIN member_cotisations mc ON mc.member_id = m.id
        WHERE (CAST(:status AS VARCHAR) IS NULL OR m.status = :status)
          AND (:search = '%%' OR LOWER(CONCAT(u.first_name, ' ', u.last_name, ' ', u.phone, ' ', COALESCE(u.email, ''))) LIKE :search)
          AND ({'m.user_id = :uid' if member_only else 'TRUE'})
        GROUP BY m.id, u.id
        ORDER BY m.status = 'pending' DESC, u.first_name, u.last_name
    """), params)).mappings().all()


async def find_user_by_email_or_phone(central: AsyncSession, email: str, phone: str):
    return (await central.execute(text("""
        SELECT id FROM users WHERE email = :email OR phone = :phone LIMIT 1
    """), {"email": email, "phone": phone})).scalar()


async def update_existing_user(central: AsyncSession, user_id: int, req: MemberCreate) -> None:
    await central.execute(text("""
        UPDATE users SET first_name = :first, last_name = :last
        WHERE id = :id
    """), {"first": req.first_name, "last": req.last_name, "id": user_id})


async def create_user(
    central: AsyncSession,
    req: MemberCreate,
    *,
    email: str,
    phone: str,
    hashed_password: str,
) -> int:
    return (await central.execute(text("""
        INSERT INTO users (email, phone, hashed_password, first_name, last_name, global_role, is_active, is_verified)
        VALUES (:email, :phone, :pwd, :first, :last, :role, true, true)
        RETURNING id
    """), {
        "email": email,
        "phone": phone,
        "pwd": hashed_password,
        "first": req.first_name,
        "last": req.last_name,
        "role": req.role.value,
    })).scalar()


async def upsert_central_membership(central: AsyncSession, ctx: dict, user_id: int, role: str) -> None:
    await central.execute(text("""
        INSERT INTO tontine_members (organization_id, user_id, tontine_id, role, status, joined_at)
        VALUES (:org, :uid, :tid, :role, 'pending', NULL)
        ON CONFLICT (user_id, tontine_id) DO UPDATE SET role = EXCLUDED.role, status = 'pending'
    """), {
        "org": ctx["organization_id"],
        "uid": user_id,
        "tid": ctx["tontine_id"],
        "role": role,
    })


async def upsert_tenant_member(db: AsyncSession, ctx: dict, user_id: int, req: MemberCreate):
    return (await db.execute(text("""
        INSERT INTO members (organization_id, tontine_id, user_id, status, role, photo, profession, address, joined_at)
        VALUES (:org, :tid, :uid, 'pending', :role, :photo, :profession, :address, NULL)
        ON CONFLICT (user_id) DO UPDATE SET
            status = 'pending',
            role = EXCLUDED.role,
            photo = EXCLUDED.photo,
            profession = EXCLUDED.profession,
            address = EXCLUDED.address,
            updated_at = NOW()
        RETURNING id, status, role
    """), {
        "org": ctx["organization_id"],
        "tid": ctx["tontine_id"],
        "uid": user_id,
        "role": req.role.value,
        "photo": req.photo,
        "profession": req.profession,
        "address": req.address,
    })).mappings().one()


async def get_member(db: AsyncSession, member_id: int, *, user_id: int, member_only: bool):
    return (await db.execute(text(f"""
        SELECT m.*, CONCAT(u.first_name, ' ', u.last_name) AS name,
               u.first_name, u.last_name, u.email, u.phone
        FROM members m
        JOIN public.users u ON u.id = m.user_id
        WHERE m.id = :id
          AND ({'m.user_id = :uid' if member_only else 'TRUE'})
    """), {"id": member_id, "uid": user_id})).mappings().one_or_none()


async def get_member_for_update(db: AsyncSession, member_id: int):
    return (await db.execute(
        text("SELECT * FROM members WHERE id = :id"),
        {"id": member_id},
    )).mappings().one_or_none()


async def update_user_fields(central: AsyncSession, user_id: int, req: MemberUpdate) -> None:
    user_sets, user_params = [], {"uid": user_id}
    for src, col in [("first_name", "first_name"), ("last_name", "last_name"), ("phone", "phone"), ("email", "email")]:
        value = getattr(req, src)
        if value is not None:
            user_sets.append(f"{col} = :{src}")
            user_params[src] = value
    if user_sets:
        await central.execute(text(f"UPDATE users SET {', '.join(user_sets)} WHERE id = :uid"), user_params)


async def update_member_fields(db: AsyncSession, member_id: int, req: MemberUpdate) -> None:
    sets, params = [], {"id": member_id}
    for src, col in [
        ("photo", "photo"), ("profession", "profession"), ("address", "address"), ("status", "status"),
    ]:
        value = getattr(req, src)
        if value is not None:
            sets.append(f"{col} = :{src}")
            params[src] = value
    if req.role is not None:
        sets.append("role = :role")
        params["role"] = req.role.value
    if sets:
        await db.execute(text(f"UPDATE members SET {', '.join(sets)}, updated_at = NOW() WHERE id = :id"), params)


async def update_central_member_role_status(central: AsyncSession, ctx: dict, user_id: int, req: MemberUpdate) -> None:
    central_sets, central_params = [], {"uid": user_id, "tid": ctx["tontine_id"]}
    if req.role is not None:
        central_sets.append("role = :role")
        central_params["role"] = req.role.value
    if req.status is not None:
        central_sets.append("status = :status")
        central_params["status"] = req.status
    if central_sets:
        await central.execute(text(
            f"UPDATE tontine_members SET {', '.join(central_sets)} WHERE user_id = :uid AND tontine_id = :tid"
        ), central_params)


async def validate_member(db: AsyncSession, member_id: int, new_status: str, validated_by: int):
    member = (await db.execute(
        text("SELECT user_id FROM members WHERE id = :id"),
        {"id": member_id},
    )).mappings().one_or_none()
    if not member:
        return None
    # :status est casté en VARCHAR pour lever l'ambiguïté de type asyncpg : le
    # même paramètre servait à la fois en affectation (status = ...) et en
    # comparaison (... = 'active'), d'où « inconsistent types deduced ».
    await db.execute(text("""
        UPDATE members
        SET status = CAST(:status AS VARCHAR),
            joined_at = CASE WHEN CAST(:status AS VARCHAR) = 'active' THEN COALESCE(joined_at, CURRENT_DATE) ELSE joined_at END,
            validated_by = :by,
            validated_at = NOW(),
            updated_at = NOW()
        WHERE id = :id
    """), {"status": new_status, "by": validated_by, "id": member_id})
    return member


async def update_central_member_status(central: AsyncSession, ctx: dict, user_id: int, status: str) -> None:
    await central.execute(text("""
        UPDATE tontine_members
        SET status = CAST(:status AS VARCHAR),
            joined_at = CASE WHEN CAST(:status AS VARCHAR) = 'active' THEN NOW() ELSE joined_at END
        WHERE user_id = :uid AND tontine_id = :tid
    """), {"status": status, "uid": user_id, "tid": ctx["tontine_id"]})


async def suspend_member(db: AsyncSession, member_id: int):
    member = (await db.execute(
        text("SELECT user_id FROM members WHERE id = :id"),
        {"id": member_id},
    )).mappings().one_or_none()
    if not member:
        return None
    await db.execute(text(
        "UPDATE members SET status = 'suspended', updated_at = NOW() WHERE id = :id"
    ), {"id": member_id})
    return member


async def member_outstanding(db: AsyncSession, member_id: int) -> dict:
    contrib = (await db.execute(text("""
        SELECT COALESCE(SUM(amount_due - amount_paid), 0) FROM member_cotisations
        WHERE member_id = :id AND status IN ('pending', 'partial', 'late')
    """), {"id": member_id})).scalar_one()
    penalties = (await db.execute(text("""
        SELECT COALESCE(SUM(amount - paid_amount), 0) FROM penalties
        WHERE member_id = :id AND status IN ('unpaid', 'partial')
    """), {"id": member_id})).scalar_one()
    loans = (await db.execute(text("""
        SELECT COALESCE(SUM(remaining_amount), 0) FROM loans
        WHERE member_id = :id AND status IN ('active', 'late')
    """), {"id": member_id})).scalar_one()
    contrib, penalties, loans = float(contrib), float(penalties), float(loans)
    return {
        "contributions": contrib,
        "penalties": penalties,
        "loans": loans,
        "total": round(contrib + penalties + loans, 2),
    }


async def mark_member_excluded(db: AsyncSession, member_id: int) -> None:
    await db.execute(text(
        "UPDATE members SET status = 'excluded', updated_at = NOW() WHERE id = :id"
    ), {"id": member_id})


async def cancel_future_obligations(db: AsyncSession, member_id: int) -> None:
    await db.execute(text(
        "UPDATE member_cotisations SET status = 'cancelled', updated_at = NOW() WHERE member_id = :id AND status = 'pending'"
    ), {"id": member_id})
    await db.execute(text(
        "UPDATE loans SET status = 'rejected', updated_at = NOW() WHERE member_id = :id AND status = 'pending'"
    ), {"id": member_id})
    await db.execute(text(
        "DELETE FROM tour_assignments WHERE member_id = :id AND status <> 'completed'"
    ), {"id": member_id})


async def create_member_notification(
    db: AsyncSession,
    member_id: int,
    title: str,
    body: str,
    notif_type: str,
    link: str,
) -> None:
    await db.execute(text("""
        INSERT INTO notifications (member_id, channel, subject, body, type, link, status)
        VALUES (:mid, 'app', :title, :body, :type, :link, 'sent')
    """), {
        "mid": member_id,
        "title": title,
        "body": body,
        "type": notif_type,
        "link": link,
    })


async def reinstate_member(db: AsyncSession, member_id: int) -> None:
    await db.execute(text("""
        UPDATE members SET status = 'active',
            joined_at = COALESCE(joined_at, CURRENT_DATE), updated_at = NOW()
        WHERE id = :id
    """), {"id": member_id})


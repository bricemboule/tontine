from sqlalchemy import delete as sqla_delete, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.models import (
    AuditLog,
    TontineAdminAssignment,
    TontineMember,
    TontineRegistry,
    User,
    UserRole,
)


async def admins_disponibles(db: AsyncSession):
    result = await db.execute(
        select(User, TontineRegistry)
        .outerjoin(TontineAdminAssignment, TontineAdminAssignment.user_id == User.id)
        .outerjoin(TontineRegistry, TontineRegistry.id == TontineAdminAssignment.tontine_id)
        .where(User.global_role == UserRole.ADMIN)
        .where(User.is_active.is_(True))
        .order_by(User.first_name.asc(), User.last_name.asc())
    )
    return result.all()


async def user_id_par_email(db: AsyncSession, email: str):
    return (await db.execute(select(User.id).where(User.email == email))).scalar_one_or_none()


async def user_id_par_phone(db: AsyncSession, phone: str):
    return (await db.execute(select(User.id).where(User.phone == phone))).scalar_one_or_none()


async def creer_admin(db: AsyncSession, user: User) -> User:
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def obtenir_tontine(db: AsyncSession, tontine_id: int):
    return (
        await db.execute(select(TontineRegistry).where(TontineRegistry.id == tontine_id))
    ).scalar_one_or_none()


async def solde_caisse_schema(db: AsyncSession):
    return (await db.execute(text(
        "SELECT balance FROM cash_account WHERE id = 1"
    ))).scalar_one_or_none()


async def supprimer_tontine_centrale(db: AsyncSession, tontine: TontineRegistry) -> None:
    await db.execute(sqla_delete(TontineMember).where(TontineMember.tontine_id == tontine.id))
    await db.execute(
        sqla_delete(TontineAdminAssignment).where(TontineAdminAssignment.tontine_id == tontine.id)
    )
    await db.delete(tontine)
    await db.commit()


async def journal_audit_global(db: AsyncSession, page: int, limit: int) -> list[AuditLog]:
    result = await db.execute(
        select(AuditLog)
        .order_by(AuditLog.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    )
    return list(result.scalars().all())


async def statistiques_plateforme(db: AsyncSession):
    return (await db.execute(text("""
        SELECT
            (SELECT COUNT(*) FROM organizations) AS total_organizations,
            (SELECT COUNT(*) FROM organizations WHERE status = 'active') AS active_organizations,
            (SELECT COUNT(*) FROM organizations WHERE status = 'suspended') AS suspended_organizations,
            (SELECT COUNT(*) FROM tontine_registry) AS total_tontines,
            (SELECT COUNT(*) FROM tontine_registry WHERE status = 'active') AS active_tontines,
            (SELECT COUNT(*) FROM users) AS total_users,
            (SELECT COALESCE(SUM(amount), 0) FROM subscription_payments WHERE status = 'confirmed') AS revenus_saas
    """))).mappings().one()


async def lister_organisations(db: AsyncSession):
    return (await db.execute(text("""
        SELECT o.*,
               COUNT(DISTINCT tr.id) AS tontines_count,
               COUNT(DISTINCT tm.user_id) AS members_count,
               sp.name AS plan_name
        FROM organizations o
        LEFT JOIN tontine_registry tr ON tr.organization_id = o.id
        LEFT JOIN tontine_members tm ON tm.organization_id = o.id
        LEFT JOIN subscriptions s ON s.organization_id = o.id AND s.status = 'active'
        LEFT JOIN subscription_plans sp ON sp.id = s.plan_id
        GROUP BY o.id, sp.name
        ORDER BY o.created_at DESC
    """))).mappings().all()


async def organisation_id_par_slug(db: AsyncSession, slug: str):
    return (await db.execute(
        text("SELECT id FROM organizations WHERE slug = :slug"),
        {"slug": slug},
    )).scalar()


async def creer_organisation(db: AsyncSession, values: dict):
    return (await db.execute(text("""
        INSERT INTO organizations (name, slug, logo, phone, email, city, country, address, status)
        VALUES (:name, :slug, :logo, :phone, :email, :city, :country, :address, 'active')
        RETURNING *
    """), values)).mappings().one()


async def modifier_statut_organisation(db: AsyncSession, organization_id: int, status: str):
    return (await db.execute(text("""
        UPDATE organizations SET status = :status, updated_at = NOW()
        WHERE id = :id RETURNING *
    """), {"status": status, "id": organization_id})).mappings().one_or_none()


async def lister_plans_abonnement(db: AsyncSession):
    return (await db.execute(
        text("SELECT * FROM subscription_plans ORDER BY price_monthly, id")
    )).mappings().all()


async def lister_abonnements(db: AsyncSession):
    return (await db.execute(text("""
        SELECT s.*, o.name AS organization_name, sp.name AS plan_name, sp.code AS plan_code
        FROM subscriptions s
        JOIN organizations o ON o.id = s.organization_id
        JOIN subscription_plans sp ON sp.id = s.plan_id
        ORDER BY s.created_at DESC
    """))).mappings().all()


async def lister_tontines(db: AsyncSession):
    return (await db.execute(text("""
        SELECT tr.*, o.name AS organization_name,
               admin.id AS admin_id,
               CONCAT(admin.first_name, ' ', admin.last_name) AS admin_name,
               admin.email AS admin_email,
               COUNT(tm.id) AS members_count
        FROM tontine_registry tr
        LEFT JOIN organizations o ON o.id = tr.organization_id
        LEFT JOIN tontine_admin_assignments taa ON taa.tontine_id = tr.id
        LEFT JOIN users admin ON admin.id = taa.user_id
        LEFT JOIN tontine_members tm ON tm.tontine_id = tr.id
        GROUP BY tr.id, o.name, admin.id
        ORDER BY tr.created_at DESC
    """))).mappings().all()


async def admin_actif_par_id(db: AsyncSession, admin_user_id: int):
    return (await db.execute(text("""
        SELECT * FROM users WHERE id = :id AND global_role = 'admin' AND is_active = true
    """), {"id": admin_user_id})).mappings().one_or_none()


async def tontine_assignee_admin(db: AsyncSession, admin_user_id: int):
    return (await db.execute(text("""
        SELECT id FROM tontine_admin_assignments WHERE user_id = :uid
    """), {"uid": admin_user_id})).scalar()


async def premiere_organisation_id(db: AsyncSession):
    return (await db.execute(text(
        "SELECT id FROM organizations ORDER BY id LIMIT 1"
    ))).scalar()


async def tontine_id_par_slug(db: AsyncSession, slug: str):
    return (await db.execute(
        text("SELECT id FROM tontine_registry WHERE slug = :slug"),
        {"slug": slug},
    )).scalar()


async def creer_tontine_registry(db: AsyncSession, values: dict):
    return (await db.execute(text("""
        INSERT INTO tontine_registry (
            organization_id, name, slug, schema_name, type, status, currency,
            created_by, description, contribution_amount, frequency, start_date, end_date, max_members
        )
        VALUES (:org, :name, :slug, :schema, :type, 'draft', 'XAF',
                :by, :description, :amount, :frequency, :start, :end, :max_members)
        RETURNING *
    """), values)).mappings().one()


async def assigner_admin_tontine(
    db: AsyncSession,
    organization_id: int,
    admin_user_id: int,
    tontine_id: int,
) -> None:
    await db.execute(text("""
        INSERT INTO tontine_admin_assignments (user_id, tontine_id)
        VALUES (:uid, :tid)
    """), {"uid": admin_user_id, "tid": tontine_id})
    await db.execute(text("""
        INSERT INTO tontine_members (organization_id, user_id, tontine_id, role, status, joined_at)
        VALUES (:org, :uid, :tid, 'admin', 'active', NOW())
        ON CONFLICT DO NOTHING
    """), {"org": organization_id, "uid": admin_user_id, "tid": tontine_id})


async def initialiser_config_tontine(db: AsyncSession, values: dict) -> None:
    await db.execute(text("""
        INSERT INTO tontine_config (name, description, type, frequency, status, currency,
                                    cotisation_amount, max_members, start_date, end_date)
        VALUES (:name, :description, :type, :frequency, 'active', 'XAF',
                :amount, :max_members, :start, :end)
    """), values)


async def modifier_tontine_registry(db: AsyncSession, tontine_id: int, values: dict):
    sets = []
    params = {"id": tontine_id}
    for key, value in values.items():
        sets.append(f"{key} = :{key}")
        params[key] = value
    return (await db.execute(text(f"""
        UPDATE tontine_registry SET {', '.join(sets)}, updated_at = NOW()
        WHERE id = :id RETURNING *
    """), params)).mappings().one_or_none()

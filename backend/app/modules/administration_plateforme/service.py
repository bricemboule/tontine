import logging
import re
import uuid

from fastapi import HTTPException
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.audit import audit
from app.common.formatting import clean_row, clean_rows
from app.common.tenant_schema import ensure_tenant_schema
from app.modules.administration_plateforme import repository
from app.modules.administration_plateforme.schema import (
    CreateAdminRequest,
    CreationOrganisation,
    CreationTontine,
    ModificationStatutOrganisation,
    ModificationTontine,
)
from app.core.security import generate_temporary_password, hash_password
from app.core.database import get_central_engine, get_tenant_db
from app.core.models import TontineType, User, UserRole

logger = logging.getLogger(__name__)

TENANT_SCHEMA_RE = re.compile(r"^tontine_[a-z0-9_]+$")


def slugify(value: str) -> str:
    slug = re.sub(r"_+", "_", re.sub(r"[^a-z0-9_]", "_", value.lower().replace(" ", "_"))).strip("_")
    return slug or f"tontine_{uuid.uuid4().hex[:6]}"


def _admin_payload(admin: User, assigned_tontine=None) -> dict:
    return {
        "id": admin.id,
        "name": admin.full_name,
        "email": admin.email,
        "phone": admin.phone,
        "available": assigned_tontine is None,
        "assigned_tontine": None if assigned_tontine is None else {
            "id": assigned_tontine.id,
            "name": assigned_tontine.name,
        },
    }


async def lister_admins_disponibles(db: AsyncSession) -> list[dict]:
    return [
        _admin_payload(admin, assigned_tontine)
        for admin, assigned_tontine in await repository.admins_disponibles(db)
    ]


async def creer_admin(db: AsyncSession, req: CreateAdminRequest) -> dict:
    if await repository.user_id_par_email(db, req.email):
        raise HTTPException(409, "Cette adresse email existe déjà")

    if await repository.user_id_par_phone(db, req.phone):
        raise HTTPException(409, "Ce numéro de téléphone existe déjà")

    temporary_password = generate_temporary_password()
    user = User(
        email=req.email,
        phone=req.phone,
        hashed_password=hash_password(temporary_password),
        first_name=req.first_name,
        last_name=req.last_name,
        global_role=UserRole.ADMIN,
        is_active=True,
        is_verified=True,
    )
    user = await repository.creer_admin(db, user)
    payload = _admin_payload(user)
    payload["role"] = user.global_role.value
    payload["temporary_password"] = temporary_password
    return payload


async def _verifier_solde_tenant(schema_name: str, force: bool) -> None:
    if force or not TENANT_SCHEMA_RE.match(schema_name):
        return

    tenant = await get_tenant_db(schema_name)
    try:
        balance = await repository.solde_caisse_schema(tenant)
    except Exception:
        balance = None
    finally:
        await tenant.close()

    if balance is not None and float(balance) != 0:
        raise HTTPException(
            409,
            f"Solde de caisse non nul ({float(balance):.0f}). "
            "Soldez la tontine ou utilisez ?force=true.",
        )


async def supprimer_tontine(db: AsyncSession, tontine_id: int, force: bool = False) -> None:
    tontine = await repository.obtenir_tontine(db, tontine_id)
    if not tontine:
        raise HTTPException(404, "Tontine introuvable")

    schema_name = tontine.schema_name
    if schema_name:
        await _verifier_solde_tenant(schema_name, force)

    await repository.supprimer_tontine_centrale(db, tontine)

    if schema_name and TENANT_SCHEMA_RE.match(schema_name):
        engine = get_central_engine()
        async with engine.begin() as conn:
            await conn.execute(text(f'DROP SCHEMA IF EXISTS "{schema_name}" CASCADE'))
        logger.info("Schéma %s supprimé", schema_name)


def _serialiser_log_global(log) -> dict:
    return {
        "id": log.id,
        "action": log.action,
        "resource": log.resource,
        "user_id": log.user_id,
        "tontine_slug": log.tontine_slug,
        "details": log.details,
        "ip": log.ip_address,
        "at": log.created_at.isoformat() if log.created_at else None,
    }


async def journal_audit_global(db: AsyncSession, page: int, limit: int) -> list[dict]:
    logs = await repository.journal_audit_global(db, page, limit)
    return [_serialiser_log_global(log) for log in logs]


async def statistiques_plateforme(db: AsyncSession) -> dict:
    return clean_row(await repository.statistiques_plateforme(db))


async def lister_organisations(db: AsyncSession) -> list[dict]:
    return clean_rows(await repository.lister_organisations(db))


async def creer_organisation(
    db: AsyncSession,
    req: CreationOrganisation,
    current_user: dict,
) -> dict:
    slug = req.slug or slugify(req.name)
    if await repository.organisation_id_par_slug(db, slug):
        raise HTTPException(409, "Ce slug d'organisation existe déjà")

    row = await repository.creer_organisation(db, req.model_dump() | {"slug": slug})
    await db.commit()
    await audit(current_user, "CREATE_ORGANIZATION", "organization", row["id"], {"name": req.name})
    return clean_row(row)


async def modifier_statut_organisation(
    db: AsyncSession,
    organization_id: int,
    req: ModificationStatutOrganisation,
    current_user: dict,
) -> dict:
    if req.status not in {"active", "suspended", "inactive"}:
        raise HTTPException(422, "Statut invalide")

    row = await repository.modifier_statut_organisation(db, organization_id, req.status)
    if not row:
        raise HTTPException(404, "Organisation introuvable")
    await db.commit()
    await audit(
        current_user,
        "UPDATE_ORGANIZATION_STATUS",
        "organization",
        organization_id,
        {"status": req.status},
    )
    return clean_row(row)


async def lister_plans_abonnement(db: AsyncSession) -> list[dict]:
    return clean_rows(await repository.lister_plans_abonnement(db))


async def lister_abonnements(db: AsyncSession) -> list[dict]:
    return clean_rows(await repository.lister_abonnements(db))


async def lister_tontines(db: AsyncSession) -> list[dict]:
    data = []
    for row in await repository.lister_tontines(db):
        item = clean_row(row)
        item["admin"] = None if not item.get("admin_id") else {
            "id": item["admin_id"],
            "name": item["admin_name"],
            "email": item["admin_email"],
        }
        data.append(item)
    return data


async def _slug_tontine_unique(db: AsyncSession, name: str) -> str:
    base_slug = slugify(name)
    slug = base_slug
    suffix = 2
    while await repository.tontine_id_par_slug(db, slug):
        slug = f"{base_slug}_{suffix}"
        suffix += 1
    return slug


async def creer_tontine(
    db: AsyncSession,
    req: CreationTontine,
    current_user: dict,
) -> dict:
    admin = await repository.admin_actif_par_id(db, req.admin_user_id)
    if not admin:
        raise HTTPException(404, "Administrateur introuvable")
    if await repository.tontine_assignee_admin(db, req.admin_user_id):
        raise HTTPException(409, "Cet administrateur gère déjà une tontine")

    # Une tontine appartient toujours à une organisation (compte client du SaaS).
    # Si aucune n'existe encore, on en crée une par défaut au lieu de bloquer :
    # l'admin n'a pas à passer par l'étape « organisation » manuellement.
    org_id = req.organization_id or await repository.premiere_organisation_id(db)
    if not org_id:
        org = await repository.creer_organisation(db, {
            "name": req.name,
            "slug": f"{slugify(req.name)}-{uuid.uuid4().hex[:6]}",
            "logo": None,
            "phone": None,
            "email": None,
            "city": None,
            "country": "Cameroun",
            "address": None,
        })
        org_id = org["id"]

    slug = await _slug_tontine_unique(db, req.name)
    schema_name = f"tontine_{slug}"
    type_value = req.type if req.type in {item.value for item in TontineType} else TontineType.MIXTE.value

    row = await repository.creer_tontine_registry(db, {
        "org": org_id,
        "name": req.name,
        "slug": slug,
        "schema": schema_name,
        "type": type_value,
        "by": int(current_user["sub"]),
        "description": req.description,
        "amount": req.contribution_amount,
        "frequency": req.frequency,
        "start": req.start_date,
        "end": req.end_date,
        "max_members": req.max_members,
    })
    await repository.assigner_admin_tontine(db, org_id, req.admin_user_id, row["id"])
    await db.commit()

    await ensure_tenant_schema(schema_name)
    tenant = await get_tenant_db(schema_name)
    try:
        await repository.initialiser_config_tontine(tenant, {
            "name": req.name,
            "description": req.description,
            "type": req.type,
            "frequency": req.frequency,
            "amount": req.contribution_amount,
            "max_members": req.max_members,
            "start": req.start_date,
            "end": req.end_date,
        })
        await tenant.commit()
    finally:
        await tenant.close()

    await audit(current_user, "CREATE_TONTINE", "tontine", row["id"], {"schema": schema_name})
    item = clean_row(row)
    item["admin"] = {
        "id": admin["id"],
        "name": f"{admin['first_name']} {admin['last_name']}",
        "email": admin["email"],
    }
    item["members_count"] = 0
    return item


async def modifier_tontine(
    db: AsyncSession,
    tontine_id: int,
    req: ModificationTontine,
    current_user: dict,
) -> dict:
    values = req.model_dump(exclude_unset=True)
    if not values:
        raise HTTPException(422, "Aucune donnée à mettre à jour")

    row = await repository.modifier_tontine_registry(db, tontine_id, values)
    if not row:
        raise HTTPException(404, "Tontine introuvable")
    await db.commit()
    await audit(current_user, "UPDATE_TONTINE", "tontine", tontine_id, values)
    return clean_row(row)

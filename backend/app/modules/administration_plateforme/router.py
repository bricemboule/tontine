from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.administration_plateforme import service
from app.modules.administration_plateforme.permissions import (
    peut_gerer_plateforme,
    peut_lire_audit_global,
)
from app.modules.administration_plateforme.schema import (
    CreateAdminRequest,
    CreationOrganisation,
    CreationTontine,
    ModificationStatutOrganisation,
    ModificationTontine,
)
from app.core.database import get_central_db

router = APIRouter(prefix="/superadmin", tags=["Administration plateforme"])


@router.get("/admins")
async def lister_admins_disponibles(
    _: dict = peut_gerer_plateforme,
    db: AsyncSession = Depends(get_central_db),
):
    return await service.lister_admins_disponibles(db)


@router.get("/stats")
async def statistiques_plateforme(
    _: dict = peut_gerer_plateforme,
    db: AsyncSession = Depends(get_central_db),
):
    return await service.statistiques_plateforme(db)


@router.get("/organizations")
async def lister_organisations(
    _: dict = peut_gerer_plateforme,
    db: AsyncSession = Depends(get_central_db),
):
    return await service.lister_organisations(db)


@router.post("/organizations", status_code=201)
async def creer_organisation(
    req: CreationOrganisation,
    current_user: dict = peut_gerer_plateforme,
    db: AsyncSession = Depends(get_central_db),
):
    return await service.creer_organisation(db, req, current_user)


@router.patch("/organizations/{organization_id}/status")
async def modifier_statut_organisation(
    organization_id: int,
    req: ModificationStatutOrganisation,
    current_user: dict = peut_gerer_plateforme,
    db: AsyncSession = Depends(get_central_db),
):
    return await service.modifier_statut_organisation(db, organization_id, req, current_user)


@router.get("/subscription-plans")
async def lister_plans_abonnement(
    _: dict = peut_gerer_plateforme,
    db: AsyncSession = Depends(get_central_db),
):
    return await service.lister_plans_abonnement(db)


@router.get("/subscriptions")
async def lister_abonnements(
    _: dict = peut_gerer_plateforme,
    db: AsyncSession = Depends(get_central_db),
):
    return await service.lister_abonnements(db)


@router.get("/tontines")
async def lister_tontines(
    _: dict = peut_gerer_plateforme,
    db: AsyncSession = Depends(get_central_db),
):
    return await service.lister_tontines(db)


@router.post("/tontines", status_code=201)
async def creer_tontine(
    req: CreationTontine,
    current_user: dict = peut_gerer_plateforme,
    db: AsyncSession = Depends(get_central_db),
):
    return await service.creer_tontine(db, req, current_user)


@router.patch("/tontines/{tontine_id}")
async def modifier_tontine(
    tontine_id: int,
    req: ModificationTontine,
    current_user: dict = peut_gerer_plateforme,
    db: AsyncSession = Depends(get_central_db),
):
    return await service.modifier_tontine(db, tontine_id, req, current_user)


@router.post("/admins", status_code=201)
async def creer_admin(
    req: CreateAdminRequest,
    _: dict = peut_gerer_plateforme,
    db: AsyncSession = Depends(get_central_db),
):
    return await service.creer_admin(db, req)


@router.delete("/tontines/{tontine_id}", status_code=204)
async def supprimer_tontine(
    tontine_id: int,
    force: bool = False,
    _: dict = peut_gerer_plateforme,
    db: AsyncSession = Depends(get_central_db),
):
    await service.supprimer_tontine(db, tontine_id, force)


@router.get("/audit")
async def journal_audit_global(
    page: int = 1,
    limit: int = 50,
    _: dict = peut_lire_audit_global,
    db: AsyncSession = Depends(get_central_db),
):
    return await service.journal_audit_global(db, page, limit)

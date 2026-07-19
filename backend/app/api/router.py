from fastapi import FastAPI

from app.integrations.mobile_money.router import router as mobile_money_webhooks_router
from app.modules.administration_plateforme.router import router as administration_plateforme_router
from app.modules.auth.router import router as auth_router
from app.modules.caisse.router import router as caisse_router
from app.modules.cotisations.router import router as cotisations_router
from app.modules.cycles.router import router as cycles_router
from app.modules.decaissements.router import router as decaissements_router
from app.modules.journaux_audit.router import router as journaux_audit_router
from app.modules.meetings.router import router as meetings_router
from app.modules.members.router import router as members_router
from app.modules.notifications.router import router as notifications_router
from app.modules.parametres.router import router as parametres_router
from app.modules.payments.router import router as payments_router
from app.modules.penalites.router import router as penalites_router
from app.modules.prets.router import router as prets_router
from app.modules.rapports.router import router as rapports_router
from app.modules.recus.router import router as recus_router
from app.modules.sanctions.router import router as sanctions_router
from app.modules.tableaux_de_bord.router import router as tableaux_de_bord_router
from app.modules.tontines.router import router as tontines_router
from app.modules.tours.router import router as tours_router


def include_app_routers(app: FastAPI) -> None:
    app.include_router(meetings_router)
    app.include_router(members_router)
    app.include_router(cotisations_router)
    app.include_router(cycles_router)
    app.include_router(caisse_router)
    app.include_router(payments_router)
    app.include_router(recus_router)
    app.include_router(penalites_router)
    app.include_router(sanctions_router)
    app.include_router(prets_router)
    app.include_router(tours_router)
    app.include_router(decaissements_router)
    app.include_router(notifications_router)
    app.include_router(parametres_router)
    app.include_router(tontines_router)
    app.include_router(tableaux_de_bord_router)
    app.include_router(rapports_router)
    app.include_router(journaux_audit_router)
    app.include_router(auth_router)
    app.include_router(administration_plateforme_router)
    app.include_router(mobile_money_webhooks_router)

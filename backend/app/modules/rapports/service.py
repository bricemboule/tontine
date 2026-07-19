import io
from datetime import datetime

from fastapi.responses import StreamingResponse
from openpyxl import Workbook
from openpyxl.styles import Font
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.audit import audit
from app.common.cash import get_cash_balance
from app.common.formatting import clean_rows
from app.modules.caisse import service as caisse_service
from app.modules.rapports import repository
from app.core.database import get_tenant_db


async def flux_caisse(ctx: dict):
    db = await get_tenant_db(ctx["schema_name"])
    try:
        return clean_rows(await repository.flux_caisse_mensuel(db))
    finally:
        await db.close()


async def resume_financier(ctx: dict):
    return (await caisse_service.tableau_caisse(ctx))["totals"]


def _ajouter_feuille(classeur, titre: str, entetes: list[str], lignes: list[list], gras: Font) -> None:
    feuille = classeur.create_sheet(title=titre[:31])
    feuille.append(entetes)
    for cellule in feuille[1]:
        cellule.font = gras
    for ligne in lignes:
        feuille.append(ligne)
    for index, entete in enumerate(entetes, 1):
        largeur = max(len(str(entete)), *(len(str(ligne[index - 1])) for ligne in lignes)) if lignes else len(str(entete))
        feuille.column_dimensions[chr(64 + index)].width = min(largeur + 2, 40)


async def construire_classeur_rapport(db: AsyncSession, tontine_name: str):
    classeur = Workbook()
    gras = Font(bold=True)

    solde = await get_cash_balance(db)
    totaux = await repository.totaux_rapport(db)
    feuille_resume = classeur.active
    feuille_resume.title = "Résumé"
    feuille_resume.append(["Rapport financier", tontine_name])
    feuille_resume["A1"].font = gras
    feuille_resume.append(["Généré le", datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")])
    feuille_resume.append([])
    for libelle, valeur in [
        ("Solde de caisse (XAF)", solde),
        ("Total cotisations collectées", float(totaux["collecte"] or 0)),
        ("Membres actifs", int(totaux["membres_actifs"] or 0)),
        ("Pénalités dues", float(totaux["penalites_dues"] or 0)),
        ("Prêts en cours", float(totaux["prets_encours"] or 0)),
    ]:
        feuille_resume.append([libelle, valeur])

    membres = await repository.lignes_membres(db)
    _ajouter_feuille(
        classeur,
        "Membres",
        ["Nom", "Téléphone", "Rôle", "Statut", "Tour"],
        [list(ligne) for ligne in membres],
        gras,
    )

    paiements = await repository.lignes_paiements(db)
    _ajouter_feuille(
        classeur,
        "Paiements",
        ["Référence", "Membre", "Montant", "Méthode", "Statut", "Date"],
        [[ligne[0], ligne[1], float(ligne[2] or 0), ligne[3], ligne[4], str(ligne[5])] for ligne in paiements],
        gras,
    )

    mouvements = await repository.lignes_caisse(db)
    _ajouter_feuille(
        classeur,
        "Caisse",
        ["Type", "Catégorie", "Montant", "Description", "Date"],
        [[ligne[0], ligne[1], float(ligne[2] or 0), ligne[3], str(ligne[4])] for ligne in mouvements],
        gras,
    )

    buffer = io.BytesIO()
    classeur.save(buffer)
    buffer.seek(0)
    return buffer


async def exporter_rapport(ctx: dict, current_user: dict, format: str = "excel"):
    db = await get_tenant_db(ctx["schema_name"])
    try:
        buffer = await construire_classeur_rapport(db, ctx["tontine_name"])
    finally:
        await db.close()

    await audit(current_user, "EXPORT_RAPPORT", "rapport", None, {"format": format})
    filename = f"rapport_{ctx['slug']}_{datetime.utcnow():%Y%m%d}.xlsx"
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )

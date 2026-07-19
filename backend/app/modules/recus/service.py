import html

from fastapi import HTTPException, Response

from app.common.formatting import clean_row, clean_rows
from app.modules.recus import repository
from app.core.database import get_tenant_db
from app.core.models import UserRole


async def lister_recus(ctx: dict, current_user: dict, page: int, limit: int):
    db = await get_tenant_db(ctx["schema_name"])
    try:
        membre_uniquement = current_user.get("role") == UserRole.MEMBRE.value
        rows = await repository.lister_recus(
            db,
            int(current_user["sub"]),
            membre_uniquement,
            page,
            limit,
        )
        return clean_rows(rows)
    finally:
        await db.close()


async def telecharger_recu_pdf(ctx: dict, current_user: dict, recu_id: int):
    db = await get_tenant_db(ctx["schema_name"])
    try:
        membre_uniquement = current_user.get("role") == UserRole.MEMBRE.value
        row = await repository.obtenir_recu_pdf(
            db,
            recu_id,
            int(current_user["sub"]),
            membre_uniquement,
            ctx["tontine_name"],
            ctx["organization_name"],
        )
        if not row:
            raise HTTPException(404, "Reçu introuvable")
        data = clean_row(row)
    finally:
        await db.close()

    contenu_html = f"""
    <html><body style="font-family:Arial,sans-serif;padding:32px">
      <h1>{html.escape(str(data['organization_name']))}</h1>
      <h2>Reçu {html.escape(str(data['number']))}</h2>
      <p><strong>Tontine:</strong> {html.escape(str(data['tontine_name']))}</p>
      <p><strong>Membre:</strong> {html.escape(str(data['member_name']))}</p>
      <p><strong>Montant:</strong> {data['amount']:,.0f} XAF</p>
      <p><strong>Méthode:</strong> {html.escape(str(data.get('payment_method') or '-'))}</p>
      <p><strong>Référence:</strong> {html.escape(str(data.get('payment_reference') or '-'))}</p>
      <p><strong>Date:</strong> {html.escape(str(data['created_at']))}</p>
    </body></html>
    """
    try:
        from weasyprint import HTML

        pdf = HTML(string=contenu_html).write_pdf()
        return Response(
            pdf,
            media_type="application/pdf",
            headers={"Content-Disposition": f"inline; filename={data['number']}.pdf"},
        )
    except Exception:
        return Response(contenu_html, media_type="text/html")

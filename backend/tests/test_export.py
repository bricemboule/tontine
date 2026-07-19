"""Export Excel réel (#export). Nécessite TEST_DATABASE_URL + openpyxl."""
import pytest
from sqlalchemy import text

from conftest import requires_db
from app.modules.rapports.service import construire_classeur_rapport
from main import get_tenant_db

pytestmark = requires_db


async def test_workbook_est_un_xlsx_valide(tenant_schema):
    db = await get_tenant_db(tenant_schema)
    try:
        await db.execute(text(
            "INSERT INTO members (user_id, status, role) VALUES (1, 'active', 'membre')"
        ))
        await db.execute(text("""
            INSERT INTO cash_movements (organization_id, tontine_id, type, category, amount, description)
            VALUES (1, 1, 'income', 'contribution', 50000, 'Cotisation')
        """))
        await db.commit()
        buf = await construire_classeur_rapport(db, "Tontine Test")
        data = buf.getvalue()
        assert data[:2] == b"PK"     # signature ZIP -> .xlsx
        assert len(data) > 500
    finally:
        await db.close()

"""Pagination des listes à croissance non bornée (#pagination). Nécessite TEST_DATABASE_URL."""
import pytest
from sqlalchemy import text

from conftest import requires_db
from app.modules.caisse import service as caisse_service
from main import get_tenant_db

pytestmark = requires_db


async def test_cash_movements_respecte_limit_et_offset(tenant_schema, monkeypatch):
    db = await get_tenant_db(tenant_schema)
    try:
        for i in range(5):
            await db.execute(text("""
                INSERT INTO cash_movements (organization_id, tontine_id, type, category, amount, description, created_at)
                VALUES (1, 1, 'income', 'contribution', :amt, :desc, NOW() - make_interval(mins => :m))
            """), {"amt": 1000 * (i + 1), "desc": f"mvt {i}", "m": i})
        await db.commit()
    finally:
        await db.close()

    ctx = {"schema_name": tenant_schema, "organization_id": 1, "tontine_id": 1}

    page1 = await caisse_service.mouvements_caisse(ctx, None, None, 1, 2)
    page2 = await caisse_service.mouvements_caisse(ctx, None, None, 2, 2)
    page3 = await caisse_service.mouvements_caisse(ctx, None, None, 3, 2)

    assert len(page1) == 2 and len(page2) == 2 and len(page3) == 1
    # Pas de chevauchement entre pages (ids distincts)
    ids = [r["id"] for r in page1 + page2 + page3]
    assert len(ids) == len(set(ids)) == 5
    # Ordre décroissant par date : la page 1 contient les plus récents
    assert page1[0]["description"] == "mvt 0"

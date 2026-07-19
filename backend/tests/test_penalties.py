"""
Automatisation des pénalités de retard (#16). Nécessite TEST_DATABASE_URL.
"""
from datetime import date, timedelta

import pytest
from sqlalchemy import text

from conftest import requires_db
from app.modules.cotisations.service import apply_late_penalties
from main import get_tenant_db

pytestmark = requires_db


async def _seed_late_cotisation(db):
    mid = (await db.execute(text(
        "INSERT INTO members (user_id, status, role) VALUES (1, 'active', 'membre') RETURNING id"
    ))).scalar_one()
    cid = (await db.execute(text("""
        INSERT INTO cotisations (label, amount, due_date, closing_date, status)
        VALUES ('Cotisation test', 50000, :due, :close, 'open') RETURNING id
    """), {"due": date.today() - timedelta(days=15),
           "close": date.today() - timedelta(days=10)})).scalar_one()
    # Comme le fait enroll_active_members en production : organization_id / tontine_id
    # sont renseignés (la génération de pénalité les recopie sur la ligne penalties).
    await db.execute(text("""
        INSERT INTO member_cotisations (organization_id, tontine_id, member_id, cotisation_id, amount_due, amount_paid, status)
        VALUES (1, 1, :mid, :cid, 50000, 0, 'pending')
    """), {"mid": mid, "cid": cid})
    await db.commit()


async def test_penalite_creee_pour_cotisation_en_retard(tenant_schema):
    db = await get_tenant_db(tenant_schema)
    try:
        await _seed_late_cotisation(db)
        created = await apply_late_penalties(db)
        await db.commit()
        assert created == 1
        count = (await db.execute(text("SELECT COUNT(*) FROM penalties"))).scalar_one()
        assert count == 1
        amount = (await db.execute(text("SELECT amount FROM penalties LIMIT 1"))).scalar_one()
        assert float(amount) > 0
    finally:
        await db.close()


async def test_penalite_non_dupliquee_aux_executions_suivantes(tenant_schema):
    db = await get_tenant_db(tenant_schema)
    try:
        await _seed_late_cotisation(db)
        assert await apply_late_penalties(db) == 1
        await db.commit()
        # Deuxième et troisième passage : aucune nouvelle pénalité
        assert await apply_late_penalties(db) == 0
        await db.commit()
        assert await apply_late_penalties(db) == 0
        await db.commit()
        count = (await db.execute(text("SELECT COUNT(*) FROM penalties"))).scalar_one()
        assert count == 1
    finally:
        await db.close()

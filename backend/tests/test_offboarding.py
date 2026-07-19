"""
Offboarding membre (#18) : refus si solde impayé, exclusion propre, libération
du tour. Nécessite TEST_DATABASE_URL.
"""
import pytest
from datetime import date, timedelta
from fastapi import HTTPException
from sqlalchemy import text

from conftest import requires_db
from app.modules.members import service as members_service
from app.modules.members.schema import OffboardMember
from main import get_tenant_db

pytestmark = requires_db


async def _member(db, role="membre"):
    return (await db.execute(text(
        "INSERT INTO members (user_id, status, role) VALUES (1, 'active', :r) RETURNING id"
    ), {"r": role})).scalar_one()


async def test_outstanding_agrege_les_dettes(tenant_schema):
    db = await get_tenant_db(tenant_schema)
    try:
        mid = await _member(db)
        cid = (await db.execute(text("""
            INSERT INTO cotisations (label, amount, due_date, closing_date, status)
            VALUES ('C', 50000, :d, :d, 'open') RETURNING id
        """), {"d": date.today()})).scalar_one()
        await db.execute(text("""
            INSERT INTO member_cotisations (member_id, cotisation_id, amount_due, amount_paid, status)
            VALUES (:m, :c, 50000, 10000, 'partial')
        """), {"m": mid, "c": cid})
        await db.execute(text("""
            INSERT INTO penalties (organization_id, tontine_id, member_id, reason, amount, paid_amount, status, due_date)
            VALUES (1, 1, :m, 'x', 2000, 0, 'unpaid', CURRENT_DATE)
        """), {"m": mid})
        await db.commit()
        debt = await members_service.member_outstanding(db, mid)
        assert debt["contributions"] == 40000.0
        assert debt["penalties"] == 2000.0
        assert debt["total"] == 42000.0
    finally:
        await db.close()


class _FakeCentral:
    """Session centrale minimale : execute/commit no-op pour l'appel offboard."""
    async def execute(self, *a, **k): return None
    async def commit(self): return None


async def test_offboard_refuse_si_dette_sans_force(tenant_schema, monkeypatch):
    db = await get_tenant_db(tenant_schema)
    try:
        mid = await _member(db)
        cid = (await db.execute(text("""
            INSERT INTO cotisations (label, amount, due_date, closing_date, status)
            VALUES ('C', 50000, :d, :d, 'open') RETURNING id
        """), {"d": date.today()})).scalar_one()
        await db.execute(text("""
            INSERT INTO member_cotisations (member_id, cotisation_id, amount_due, amount_paid, status)
            VALUES (:m, :c, 50000, 0, 'late')
        """), {"m": mid, "c": cid})
        await db.commit()
    finally:
        await db.close()

    ctx = {"schema_name": tenant_schema, "organization_id": 1, "tontine_id": 1}
    user = {"sub": "1", "role": "president", "schema": tenant_schema}
    with pytest.raises(HTTPException) as exc:
        await members_service.offboard_member(ctx, mid, OffboardMember(reason="x", force=False), user, _FakeCentral())
    assert exc.value.status_code == 409


async def test_offboard_force_exclut_et_libere_le_tour(tenant_schema, monkeypatch):
    db = await get_tenant_db(tenant_schema)
    try:
        mid = await _member(db)
        await db.execute(text("""
            INSERT INTO tour_assignments (member_id, order_position, status)
            VALUES (:m, 1, 'pending')
        """), {"m": mid})
        await db.commit()
    finally:
        await db.close()

    ctx = {"schema_name": tenant_schema, "organization_id": 1, "tontine_id": 1}
    user = {"sub": "1", "role": "president", "schema": tenant_schema}
    res = await members_service.offboard_member(ctx, mid, OffboardMember(reason="départ", force=True), user, _FakeCentral())
    assert res["status"] == "excluded"

    db = await get_tenant_db(tenant_schema)
    try:
        status = (await db.execute(text("SELECT status FROM members WHERE id = :id"), {"id": mid})).scalar_one()
        assert status == "excluded"
        tours = (await db.execute(text("SELECT COUNT(*) FROM tour_assignments WHERE member_id = :id"), {"id": mid})).scalar_one()
        assert tours == 0  # tour non payé libéré
    finally:
        await db.close()


async def test_reinstate_reactive_un_membre_exclu(tenant_schema, monkeypatch):
    db = await get_tenant_db(tenant_schema)
    try:
        mid = await _member(db)
        await db.execute(text("UPDATE members SET status = 'excluded' WHERE id = :id"), {"id": mid})
        await db.commit()
    finally:
        await db.close()

    ctx = {"schema_name": tenant_schema, "organization_id": 1, "tontine_id": 1}
    user = {"sub": "1", "role": "president", "schema": tenant_schema}
    res = await members_service.reinstate_member(ctx, mid, user, _FakeCentral())
    assert res["status"] == "active"

    db = await get_tenant_db(tenant_schema)
    try:
        status = (await db.execute(text("SELECT status FROM members WHERE id = :id"), {"id": mid})).scalar_one()
        assert status == "active"
    finally:
        await db.close()


async def _async(value):
    return value

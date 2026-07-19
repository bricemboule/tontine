"""
Réconciliation mobile money par webhook (#mobile-money).
Un paiement 'processing' devient 'success' (+ caisse + reçu) à réception du
webhook, de façon idempotente. Nécessite TEST_DATABASE_URL.
"""
import uuid

import pytest
from sqlalchemy import text

from conftest import requires_db
from app.common.cash import get_cash_balance
from app.modules.payments.service import reconcile_mobile_payment
from main import get_central_engine, get_tenant_db

pytestmark = requires_db

PAYMENT_INTENTS_DDL = """
CREATE TABLE IF NOT EXISTS payment_intents (
    reference VARCHAR(100) PRIMARY KEY, schema_name VARCHAR(100) NOT NULL,
    payment_id BIGINT, organization_id BIGINT, tontine_id BIGINT, member_id BIGINT,
    amount NUMERIC(15,2) NOT NULL, method VARCHAR(20) NOT NULL, phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'processing', provider_ref VARCHAR(120),
    created_at TIMESTAMPTZ DEFAULT NOW(), completed_at TIMESTAMPTZ
)
"""


async def _seed_processing_payment(schema, method="orange_money", amount=50000):
    ref = f"TOS-MOMO-{uuid.uuid4().hex[:8].upper()}"
    engine = get_central_engine()
    async with engine.begin() as conn:
        await conn.execute(text(PAYMENT_INTENTS_DDL))

    db = await get_tenant_db(schema)
    try:
        mid = (await db.execute(text(
            "INSERT INTO members (user_id, status, role) VALUES (1, 'active', 'membre') RETURNING id"
        ))).scalar_one()
        pid = (await db.execute(text("""
            INSERT INTO payments (organization_id, tontine_id, reference, member_id, amount, method, status, description)
            VALUES (1, 1, :ref, :mid, :amt, :method, 'processing', 'Cotisation mobile')
            RETURNING id
        """), {"ref": ref, "mid": mid, "amt": amount, "method": method})).scalar_one()
        await db.commit()
    finally:
        await db.close()

    async with engine.begin() as conn:
        await conn.execute(text("""
            INSERT INTO payment_intents (reference, schema_name, payment_id, organization_id, tontine_id, member_id, amount, method, status)
            VALUES (:ref, :schema, :pid, 1, 1, :mid, :amt, :method, 'processing')
            ON CONFLICT (reference) DO NOTHING
        """), {"ref": ref, "schema": schema, "pid": pid, "mid": mid, "amt": amount, "method": method})
    return ref, pid


async def _payment_status(schema, pid):
    db = await get_tenant_db(schema)
    try:
        return (await db.execute(text("SELECT status FROM payments WHERE id = :id"), {"id": pid})).scalar_one()
    finally:
        await db.close()


async def test_webhook_confirme_le_paiement_et_credite_la_caisse(tenant_schema):
    ref, pid = await _seed_processing_payment(tenant_schema, amount=50000)
    res = await reconcile_mobile_payment(ref, ok=True, provider_ref="OM-123")
    assert res["status"] == "success"
    assert await _payment_status(tenant_schema, pid) == "success"

    db = await get_tenant_db(tenant_schema)
    try:
        assert await get_cash_balance(db) == 50000.0
        receipts = (await db.execute(text("SELECT COUNT(*) FROM receipts"))).scalar_one()
        assert receipts == 1
    finally:
        await db.close()


async def test_webhook_idempotent(tenant_schema):
    ref, pid = await _seed_processing_payment(tenant_schema, amount=50000)
    await reconcile_mobile_payment(ref, ok=True)
    again = await reconcile_mobile_payment(ref, ok=True)   # rejeu du webhook
    assert again.get("already") is True

    db = await get_tenant_db(tenant_schema)
    try:
        assert await get_cash_balance(db) == 50000.0   # pas de double crédit
        receipts = (await db.execute(text("SELECT COUNT(*) FROM receipts"))).scalar_one()
        assert receipts == 1
    finally:
        await db.close()


async def test_webhook_echec_marque_failed(tenant_schema):
    ref, pid = await _seed_processing_payment(tenant_schema, amount=50000)
    res = await reconcile_mobile_payment(ref, ok=False)
    assert res["status"] == "failed"
    assert await _payment_status(tenant_schema, pid) == "failed"

    db = await get_tenant_db(tenant_schema)
    try:
        assert await get_cash_balance(db) == 0.0   # rien encaissé
    finally:
        await db.close()

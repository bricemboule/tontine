"""
Filet des paiements mobiles bloqués (#polling). Un intent 'processing' trop vieux
est expiré (payment -> failed) ; un récent reste intact. Nécessite TEST_DATABASE_URL.
"""
import uuid

import pytest
from sqlalchemy import text

from conftest import requires_db
from app.modules.payments.service import sweep_stuck_mobile_payments
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


async def _seed(schema, age_minutes):
    ref = f"TOS-STUCK-{uuid.uuid4().hex[:8].upper()}"
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
            VALUES (1, 1, :ref, :mid, 50000, 'orange_money', 'processing', 'x') RETURNING id
        """), {"ref": ref, "mid": mid})).scalar_one()
        await db.commit()
    finally:
        await db.close()
    async with engine.begin() as conn:
        await conn.execute(text("""
            INSERT INTO payment_intents (reference, schema_name, payment_id, organization_id, tontine_id, member_id, amount, method, status, created_at)
            VALUES (:ref, :schema, :pid, 1, 1, :mid, 50000, 'orange_money', 'processing',
                    NOW() - make_interval(mins => :age))
        """), {"ref": ref, "schema": schema, "pid": pid, "mid": mid, "age": age_minutes})
    return ref, pid


async def _status(schema, pid):
    db = await get_tenant_db(schema)
    try:
        return (await db.execute(text("SELECT status FROM payments WHERE id = :id"), {"id": pid})).scalar_one()
    finally:
        await db.close()


async def test_intent_trop_vieux_est_expire(tenant_schema):
    ref, pid = await _seed(tenant_schema, age_minutes=200)
    res = await sweep_stuck_mobile_payments(pending_after_min=15, expire_after_min=120)
    assert res["expired"] >= 1
    assert await _status(tenant_schema, pid) == "failed"


async def test_intent_recent_reste_intact(tenant_schema):
    ref, pid = await _seed(tenant_schema, age_minutes=2)
    await sweep_stuck_mobile_payments(pending_after_min=15, expire_after_min=120)
    assert await _status(tenant_schema, pid) == "processing"

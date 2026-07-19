"""Idempotence des écritures de paiement (Vague 1). Nécessite TEST_DATABASE_URL."""
import pytest

from conftest import requires_db
from app.common.idempotency import idempotency_lookup, idempotency_store
from main import get_tenant_db

pytestmark = requires_db


async def test_cle_absente_ne_memorise_rien(tenant_schema):
    db = await get_tenant_db(tenant_schema)
    try:
        assert await idempotency_lookup(db, None, "pay_cotisation") is None
        await idempotency_store(db, None, "pay_cotisation", {"id": 1})  # no-op
        await db.commit()
    finally:
        await db.close()


async def test_meme_cle_retourne_la_reponse_memorisee(tenant_schema):
    db = await get_tenant_db(tenant_schema)
    try:
        key = "idem-123"
        assert await idempotency_lookup(db, key, "pay_cotisation") is None
        await idempotency_store(db, key, "pay_cotisation", {"id": 42, "status": "success"})
        await db.commit()

        cached = await idempotency_lookup(db, key, "pay_cotisation")
        assert cached == {"id": 42, "status": "success"}

        # Deuxième store avec la même clé : ne doit pas écraser (ON CONFLICT DO NOTHING)
        await idempotency_store(db, key, "pay_cotisation", {"id": 99, "status": "success"})
        await db.commit()
        assert (await idempotency_lookup(db, key, "pay_cotisation"))["id"] == 42
    finally:
        await db.close()


async def test_cle_isolee_par_scope(tenant_schema):
    db = await get_tenant_db(tenant_schema)
    try:
        await idempotency_store(db, "k", "pay_cotisation", {"id": 1})
        await db.commit()
        # Même clé, scope différent -> pas de collision côté lookup
        assert await idempotency_lookup(db, "k", "initiate_payment") is None
    finally:
        await db.close()

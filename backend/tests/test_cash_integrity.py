"""
Intégrité de la caisse (Vague 1) — teste directement la couche argent :
- garantie DB non-négative (CHECK) ;
- sérialisation des décaissements concurrents (verrou FOR UPDATE) ;
- réconciliation cash_account.balance == SUM(cash_movements).

Nécessite TEST_DATABASE_URL (sinon skip).
"""
import asyncio

import pytest
from fastapi import HTTPException
from sqlalchemy import text

from conftest import requires_db
from app.common.cash import add_cash_movement, get_cash_balance, lock_cash_balance
from main import get_tenant_db

pytestmark = requires_db


async def _reconciliation_ok(db) -> bool:
    account = (await db.execute(text("SELECT balance FROM cash_account WHERE id = 1"))).scalar_one()
    movements = (await db.execute(text(
        "SELECT COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE -amount END),0) FROM cash_movements"
    ))).scalar_one()
    return float(account) == float(movements)


async def test_solde_ne_peut_pas_devenir_negatif(tenant_schema):
    db = await get_tenant_db(tenant_schema)
    try:
        await add_cash_movement(db, 1, 1, "income", "seed", 50000, "seed", None, None, 1)
        await db.commit()
        # Décaissement supérieur au solde -> refus (CHECK -> HTTPException 409)
        with pytest.raises(HTTPException) as exc:
            await add_cash_movement(db, 1, 1, "expense", "payout", 80000, "trop", None, None, 1)
        assert exc.value.status_code == 409
        await db.rollback()
        assert await get_cash_balance(db) == 50000.0
        assert await _reconciliation_ok(db)
    finally:
        await db.close()


async def test_reconciliation_apres_operations(tenant_schema):
    db = await get_tenant_db(tenant_schema)
    try:
        await add_cash_movement(db, 1, 1, "income", "contribution", 100000, "c", None, None, 1)
        await add_cash_movement(db, 1, 1, "income", "contribution", 25000, "c", None, None, 1)
        await add_cash_movement(db, 1, 1, "expense", "payout", 40000, "p", None, None, 1)
        await db.commit()
        assert await get_cash_balance(db) == 85000.0
        assert await _reconciliation_ok(db)
    finally:
        await db.close()


async def test_decaissements_concurrents_serialises(tenant_schema):
    # Caisse = 100 000 ; deux décaissements de 70 000 en parallèle : un seul doit passer.
    seed = await get_tenant_db(tenant_schema)
    try:
        await add_cash_movement(seed, 1, 1, "income", "seed", 100000, "seed", None, None, 1)
        await seed.commit()
    finally:
        await seed.close()

    async def try_payout(amount):
        db = await get_tenant_db(tenant_schema)
        try:
            balance = await lock_cash_balance(db)      # FOR UPDATE : sérialise
            if balance < amount:
                await db.rollback()
                return "refused"
            await add_cash_movement(db, 1, 1, "expense", "payout", amount, "p", None, None, 1)
            await db.commit()
            return "ok"
        except HTTPException:
            await db.rollback()
            return "refused"
        finally:
            await db.close()

    results = sorted(await asyncio.gather(try_payout(70000), try_payout(70000)))
    assert results == ["ok", "refused"]

    check = await get_tenant_db(tenant_schema)
    try:
        assert await get_cash_balance(check) == 30000.0
        assert await get_cash_balance(check) >= 0
        assert await _reconciliation_ok(check)
    finally:
        await check.close()

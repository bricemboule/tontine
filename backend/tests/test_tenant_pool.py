"""
Pool tenant partagé (#13) : un seul moteur pour tous les schémas, isolation
préservée par search_path. Nécessite TEST_DATABASE_URL.
"""
import uuid

import pytest
from sqlalchemy import text

from conftest import TEST_DATABASE_URL, requires_db
from app.common.cash import add_cash_movement, get_cash_balance
from app.common.tenant_schema import tenant_sql
from main import get_tenant_db, get_tenant_engine, make_engine

pytestmark = requires_db


def test_moteur_tenant_unique():
    # get_tenant_engine renvoie toujours la même instance (pool unique borné)
    assert get_tenant_engine() is get_tenant_engine()


async def test_isolation_des_schemas_sur_pool_partage(tenant_schema):
    schema_a = tenant_schema
    schema_b = f"tontine_test_{uuid.uuid4().hex[:10]}"
    admin_engine = make_engine(TEST_DATABASE_URL)
    async with admin_engine.begin() as conn:
        for sql in tenant_sql(schema_b):
            await conn.execute(text(sql))
    try:
        db_a = await get_tenant_db(schema_a)
        try:
            await add_cash_movement(db_a, 1, 1, "income", "seed", 1000, "a", None, None, 1)
            await db_a.commit()
        finally:
            await db_a.close()

        db_b = await get_tenant_db(schema_b)
        try:
            await add_cash_movement(db_b, 1, 1, "income", "seed", 2000, "b", None, None, 1)
            await db_b.commit()
        finally:
            await db_b.close()

        # Chaque schéma ne voit que ses propres données, bien qu'ils partagent le pool
        check_a = await get_tenant_db(schema_a)
        check_b = await get_tenant_db(schema_b)
        try:
            assert await get_cash_balance(check_a) == 1000.0
            assert await get_cash_balance(check_b) == 2000.0
        finally:
            await check_a.close()
            await check_b.close()
    finally:
        async with admin_engine.begin() as conn:
            await conn.execute(text(f'DROP SCHEMA IF EXISTS "{schema_b}" CASCADE'))
        await admin_engine.dispose()

"""
Régression : les écritures via get_tenant_db doivent réellement être committées.

Bug historique : get_tenant_db posait le search_path sur une connexion brute
AVANT de créer la Session ; la Session « rejoignait une transaction externe »
et Session.commit() n'émettait qu'un SAVEPOINT — le COMMIT réel n'était jamais
émis. Résultat : toutes les écritures tenant (membres, cotisations, etc.)
étaient perdues alors que l'API renvoyait 201.

Ce test écrit dans une session, committe, puis relit dans une SECONDE session :
sans le correctif, la donnée est invisible (non committée).
"""
import pytest
from sqlalchemy import text

from conftest import requires_db
from main import get_tenant_db

pytestmark = requires_db


async def test_tenant_write_is_committed(tenant_schema):
    schema = tenant_schema

    # 1) Écriture + commit dans une première session (le chemin applicatif réel).
    db1 = await get_tenant_db(schema)
    try:
        member_id = (await db1.execute(text("""
            INSERT INTO members (organization_id, tontine_id, user_id, status, role)
            VALUES (1, 1, 999001, 'pending', 'membre')
            RETURNING id
        """))).scalar_one()
        await db1.commit()
    finally:
        await db1.close()

    assert member_id is not None

    # 2) Relecture dans une SECONDE session : la donnée doit être visible.
    db2 = await get_tenant_db(schema)
    try:
        found = (await db2.execute(
            text("SELECT id, status FROM members WHERE user_id = 999001")
        )).mappings().first()
    finally:
        await db2.close()

    assert found is not None, "écriture tenant non persistée : commit non émis"
    assert found["id"] == member_id
    assert found["status"] == "pending"


async def test_tenant_search_path_scopes_to_schema(tenant_schema):
    """Le search_path doit bien cibler le schéma tenant (isolation)."""
    db = await get_tenant_db(tenant_schema)
    try:
        current = (await db.execute(text("SHOW search_path"))).scalar_one()
    finally:
        await db.close()
    assert tenant_schema in current

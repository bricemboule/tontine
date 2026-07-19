"""
Harnais de tests TontineOS.

- Les tests unitaires purs (calculs) tournent partout, sans base.
- Les tests d'intégration exigent un PostgreSQL de test, fourni via la variable
  d'environnement TEST_DATABASE_URL (format SQLAlchemy asyncpg). Sans elle, ils
  sont ignorés (skip) plutôt que d'échouer.

Exemple :
    TEST_DATABASE_URL="postgresql+asyncpg://postgres:postgres@localhost:5433/tontine_test" \
        pytest backend/tests -q
"""
import os
import uuid

import pytest

TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL")

# On configure l'environnement AVANT d'importer l'application (main lit ces valeurs
# au chargement du module).
os.environ.setdefault("ENVIRONMENT", "test")
os.environ.setdefault("SECRET_KEY", "test-secret-key-not-for-production-000000")
if TEST_DATABASE_URL:
    os.environ["DATABASE_URL"] = TEST_DATABASE_URL

requires_db = pytest.mark.skipif(
    not TEST_DATABASE_URL,
    reason="TEST_DATABASE_URL non défini — tests d'intégration ignorés",
)


@pytest.fixture
async def tenant_schema():
    """Provisionne un schéma tenant jetable et le supprime en fin de test."""
    from sqlalchemy import text
    from main import make_engine
    from app.common.tenant_schema import tenant_sql

    schema = f"tontine_test_{uuid.uuid4().hex[:10]}"
    engine = make_engine(TEST_DATABASE_URL)
    async with engine.begin() as conn:
        for sql in tenant_sql(schema):
            await conn.execute(text(sql))
    try:
        yield schema
    finally:
        async with engine.begin() as conn:
            await conn.execute(text(f'DROP SCHEMA IF EXISTS "{schema}" CASCADE'))
        await engine.dispose()


@pytest.fixture
async def tenant_db(tenant_schema):
    """Session SQLAlchemy avec search_path positionné sur le schéma jetable."""
    from main import get_tenant_db

    db = await get_tenant_db(tenant_schema)
    try:
        yield db
    finally:
        await db.close()

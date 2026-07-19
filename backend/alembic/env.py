"""
Environnement Alembic pour TontineOS (SQLAlchemy async).

- Schéma central (public) : migrations classiques, autogenerate branché sur
  Base.metadata (modèles ORM de app.core.models : users, tontine_registry, refresh_tokens, ...).
- Schémas tenant : les tables sont en SQL brut (pas d'ORM). Les migrations tenant
  s'écrivent à la main et se propagent à tous les schémas via `for_each_tenant`
  (voir alembic/tenant.py), en positionnant search_path pour chaque schéma.

Baseline : l'état initial est matérialisé par backend/init.sql +
app.core.bootstrap.ensure_saas_schema et app.common.tenant_schema. La révision
0001 est un point de départ vide ; toute évolution de schéma passe désormais par
une nouvelle révision.
"""
import asyncio
import os
import sys

from alembic import context
from sqlalchemy import pool
from sqlalchemy.ext.asyncio import async_engine_from_config

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import DATABASE_URL  # noqa: E402
from app.core.models import Base  # noqa: E402

config = context.config
config.set_main_option("sqlalchemy.url", DATABASE_URL)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    context.configure(
        url=DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def _do_run_migrations(connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(_do_run_migrations)
    await connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())

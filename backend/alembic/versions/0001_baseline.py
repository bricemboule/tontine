"""baseline — état initial matérialisé par init.sql + ensure_saas_schema

Cette révision est volontairement vide : elle sert de point d'ancrage pour la
chaîne de migrations. Le schéma existant (central + tenant) est créé au runtime
par backend/init.sql, app.core.bootstrap.ensure_saas_schema et
app.common.tenant_schema.

Sur une base déjà provisionnée, marquer cette révision sans rien exécuter :
    alembic stamp 0001

Toute évolution ultérieure du schéma se fait via une nouvelle révision chaînée
(central : autogenerate ; tenant : SQL manuel + alembic.tenant.for_each_tenant).

Revision ID: 0001
Revises:
Create Date: 2026-07-01
"""
from alembic import op  # noqa: F401
import sqlalchemy as sa  # noqa: F401

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

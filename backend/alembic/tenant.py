"""
Helper de migration multi-schéma pour les tables tenant.

Usage dans une révision Alembic tenant :

    from alembic import op
    from alembic.tenant import for_each_tenant

    def upgrade():
        for_each_tenant(lambda schema: op.execute(
            f'ALTER TABLE "{schema}".loans ADD COLUMN IF NOT EXISTS grace_days SMALLINT DEFAULT 0'
        ))

`for_each_tenant` récupère tous les schémas depuis tontine_registry et exécute
la fonction fournie pour chacun, sur la connexion Alembic courante.
"""
import re

from alembic import op
from sqlalchemy import text

TENANT_RE = re.compile(r"^tontine_[a-z0-9_]+$")


def all_tenant_schemas() -> list[str]:
    conn = op.get_bind()
    rows = conn.execute(text(
        "SELECT schema_name FROM tontine_registry WHERE schema_name IS NOT NULL"
    )).scalars().all()
    return [s for s in rows if TENANT_RE.match(s)]


def for_each_tenant(fn) -> None:
    """Applique fn(schema) à chaque schéma tenant existant."""
    for schema in all_tenant_schemas():
        fn(schema)

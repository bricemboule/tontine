# Migrations Alembic — TontineOS

Architecture multi-schéma : un schéma `public` (central) + N schémas `tontine_*`
identiques. Alembic gère ici les évolutions **futures** ; le schéma initial est
posé au runtime par `init.sql`, `app.core.bootstrap.ensure_saas_schema` et
`app.common.tenant_schema`.

## Mise en route sur une base existante
```bash
alembic stamp 0001        # marque la baseline sans rien exécuter
```

## Créer une migration du schéma central (users, refresh_tokens, ...)
```bash
alembic revision --autogenerate -m "ajout colonne X"
alembic upgrade head
```
L'autogenerate se base sur les modèles ORM de `models.py` (`Base.metadata`).

## Créer une migration des tables tenant (raw SQL, appliquée à tous les schémas)
```bash
alembic revision -m "colonne tenant Y"
```
Puis dans le fichier généré :
```python
from alembic.tenant import for_each_tenant

def upgrade():
    for_each_tenant(lambda s: op.execute(
        f'ALTER TABLE "{s}".loans ADD COLUMN IF NOT EXISTS grace_days SMALLINT DEFAULT 0'
    ))
```

## Objectif de convergence
À terme, faire d'Alembic la **source de vérité unique** en gelant puis en
retirant progressivement les listes DDL Python (`CENTRAL_SQL`, `tenant_sql`) et
le bloc tenant de `init.sql`. Tant que la convergence n'est pas faite, garder les
deux en cohérence.

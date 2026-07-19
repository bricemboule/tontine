# Architecture TontineOS

Ce document décrit l'état actuel après la réorganisation progressive du backend.
L'objectif est de garder une base modulaire sans casser les routes existantes.

## Vue d'ensemble

```text
tontine/
├── backend/
│   ├── main.py
│   ├── app/
│   │   ├── common/
│   │   ├── core/
│   │   ├── integrations/
│   │   ├── modules/
│   │   ├── api/
│   │   └── workers/
│   ├── alembic/
│   ├── tests/
│   ├── saas_mvp.py
│   └── mvp_schemas.py
├── src/
├── docker-compose.yml
└── documentation/
```

## Backend

`backend/main.py` est un point d'entrée compatible. La factory FastAPI vit dans
`backend/app/core/application.py`, et l'assemblage des routers dans
`backend/app/api/router.py`.

`backend/app/modules/` contient les domaines métier. Chaque module suit autant
que possible ce découpage :

```text
module/
├── router.py
├── service.py
├── repository.py
├── schema.py
└── permissions.py
```

Le flux cible est :

```text
router -> service -> repository -> SQLAlchemy -> base de données
```

## Compatibilité legacy

`backend/app/api/legacy.py` contient les wrappers legacy SaaS MVP qui conservent
les anciens noms publics. `backend/saas_mvp.py` est maintenant une façade courte
qui ré-exporte ce module.

`backend/app/api/legacy_schemas.py` ré-exporte les anciens noms de schémas MVP.
`backend/mvp_schemas.py` est une façade courte pour les imports externes. Les
schémas Pydantic métier vivent dans les modules concernés.

Ces deux fichiers ne doivent plus recevoir de nouvelle logique métier.

## Workers

Les tâches Celery vivent dans `backend/app/workers/tasks.py`. Le fichier racine
`backend/tasks.py` reste une façade pour préserver les commandes existantes
comme `celery -A tasks worker` et `celery -A tasks beat`.

## Multi-tenant

Le projet utilise un schéma PostgreSQL par tontine, avec un registre central dans
le schéma public. Le contexte tenant est résolu par `app.common.tenant`.

Les tables tenant sont créées et maintenues par :

- `app.core.bootstrap`
- `app.common.tenant_schema`
- les migrations Alembic futures

## Frontend

Le frontend est encore dans `src/`. Sa réorganisation par fonctionnalité reste à
faire progressivement. Il ne faut pas casser les routes existantes avant d'avoir
ajouté des alias ou redirections.

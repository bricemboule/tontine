# TontineOS

Application SaaS de gestion de tontines.

## Stack

- Backend : FastAPI, SQLAlchemy async, Alembic, PostgreSQL
- Frontend : React, Vite, TailwindCSS
- Tâches : Celery, Redis
- Stockage local : MinIO

## Structure du dépôt

- `Frontend/` — application React (Vite, Tailwind). **Toutes les commandes `npm run` s'exécutent depuis ce dossier.**
- `backend/` — API FastAPI (Python).
- `docker-compose.yml`, `.env` — à la racine.

## Lancer en développement

Préparer l'environnement (à la racine) :

```bash
cp .env.example .env
```

Définir au minimum `SECRET_KEY` dans `.env`.

Lancer les services de base puis le frontend Vite (depuis `Frontend/`) :

```bash
cd Frontend
npm run db:up
npm run dev
```

Avec Docker Compose complet :

```bash
docker compose up -d
```

Lancer uniquement les tâches Celery en local depuis `backend/` :

```bash
.venv/bin/celery -A tasks worker --loglevel=info
.venv/bin/celery -A tasks beat --loglevel=info
```

Accès :

- Frontend : http://localhost:5173
- API : http://localhost:8000
- Docs API : http://localhost:8000/docs
- MinIO : http://localhost:9001

## Tests et validation

Depuis `Frontend/` :

```bash
npm run test:backend
npm run lint
npm run build
```

Tests backend avec PostgreSQL :

```bash
npm run db:up
npm run db:test:create
npm run test:backend:integration
```

## Architecture

La documentation se trouve dans `documentation/` :

- `architecture.md`
- `backend-modules.md`
- `frontend-structure.md`
- `multi-tenant-security.md`
- `roles-and-permissions.md`
- `financial-transactions.md`
- `migration-plan.md`

## Règles de contribution

- Placer les routes, services, repositories et schémas dans le module métier concerné (`backend/app/modules/<module>/`).
- Contrôler les accès côté backend, jamais seulement côté frontend.
- Vérifier les tests et le build après chaque migration.

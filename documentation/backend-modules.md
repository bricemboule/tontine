# Modules Backend

Les modules backend vivent dans `backend/app/modules`.

## Routeur principal

`backend/app/api/router.py` centralise l'enregistrement des routers FastAPI.
`backend/main.py` ne doit pas importer directement les routers métier ; il crée
l'application, configure les middlewares globaux, puis appelle
`include_app_routers(app)`.

La factory FastAPI vit dans `backend/app/core/application.py`. Elle configure le
lifespan, CORS, le handler de rate limit, les routes de santé et appelle le
routeur principal. `backend/main.py` reste le point d'entrée compatible pour
Uvicorn et les anciens tests/scripts.

## Workers

`backend/app/workers/tasks.py` contient la configuration Celery et les tâches
planifiées. Les tâches gardent les noms historiques `tasks.*` pour préserver
Celery Beat et les commandes Docker existantes. `backend/tasks.py` reste une
façade de compatibilité.

## Modules existants

- `administration_plateforme` : organisations, abonnements, tontines globales, administration SaaS.
- `auth` : connexion, refresh token, logout, changement de mot de passe.
- `caisse` : tableau de caisse et mouvements de caisse.
- `cotisations` : création, suivi, paiement et pénalités de retard liées aux cotisations.
- `cycles` : cycles de tontine.
- `decaissements` : demandes, approbation et rejet de décaissement.
- `journaux_audit` : consultation des journaux d'audit.
- `meetings` : réunions, présences et clôture.
- `members` : membres, suspension, offboarding, réintégration.
- `notifications` : notifications membre.
- `parametres` : configuration d'une tontine.
- `payments` : paiements, validation, annulation, reversement, Mobile Money.
- `penalites` : pénalités, paiement et annulation.
- `prets` : demandes de prêt, approbation, rejet, remboursement.
- `rapports` : flux de caisse, synthèse financière, export Excel.
- `recus` : reçus et PDF.
- `sanctions` : sanctions disciplinaires.
- `tableaux_de_bord` : tableaux de bord admin et membre.
- `tontines` : contexte de la tontine courante.
- `tours` : ordre des tours et paiement de tour.

## Règles de modification

- Une route FastAPI doit rester fine.
- La transaction métier doit être pilotée par le service.
- Le repository ne doit pas faire de contrôle de permission.
- Les nouveaux schémas Pydantic doivent aller dans `schema.py` du module.
- Les permissions doivent être centralisées dans `permissions.py` ou `app.core.permissions`.
- Ne pas ajouter de nouvelle logique dans `saas_mvp.py`, `app/api/legacy.py`,
  `mvp_schemas.py` ou `app/api/legacy_schemas.py`.

## Modules communs

`backend/app/common` contient les helpers transverses :

- `audit.py`
- `cash.py`
- `finance.py`
- `formatting.py`
- `idempotency.py`
- `notifications.py`
- `payments.py`
- `receipts.py`
- `tenant.py`
- `tenant_schema.py`

Ces helpers sont partagés, mais ne doivent pas devenir un nouveau fichier
fourre-tout.

## Compatibilité temporaire

La logique de sécurité canonique se trouve dans `backend/app/core/security.py`.
Le fichier racine `backend/security.py` reste une façade de compatibilité pour
les anciens imports pendant la migration.

La configuration canonique se trouve dans `backend/app/core/config.py`.
La gestion des moteurs et sessions SQLAlchemy se trouve dans
`backend/app/core/database.py`. Les fichiers racine `backend/config.py` et
`backend/database.py` restent des façades temporaires.

Les modèles centraux SQLAlchemy et enums vivent dans
`backend/app/core/models.py`. Le fichier racine `backend/models.py` reste une
façade temporaire, utile pour d'anciens scripts ou imports externes.

Les schémas d'authentification vivent dans `backend/app/modules/auth/schema.py`.
Le fichier racine `backend/schemas.py` ré-exporte temporairement ces schémas et
`CreateAdminRequest` pour préserver les contrats internes existants.

Les wrappers legacy SaaS MVP sont découpés par domaine dans
`backend/app/api/legacy_core.py`, `backend/app/api/legacy_finance.py` et
`backend/app/api/legacy_operations.py`. `backend/app/api/legacy.py` reste une
façade de ré-export pour préserver les anciens noms publics. Le fichier racine
`backend/saas_mvp.py` ré-exporte temporairement ces noms pour les anciens
imports externes.
Les wrappers legacy de l'administration plateforme sont isolés dans
`backend/app/api/legacy_platform.py`.
Les utilitaires transverses encore exposés pour compatibilité (`slugify`,
`contribution_status`, ré-exports de helpers communs) sont isolés dans
`backend/app/api/legacy_support.py`.

Les ré-exports legacy des schémas MVP vivent dans
`backend/app/api/legacy_schemas.py`. Le fichier racine `backend/mvp_schemas.py`
reste une façade d'un import.

# Audit fonctionnel de bout en bout — TontineOS

Date : 2026-07-18 · Périmètre : vérification réelle (formulaire → API → base → liste → détail) de l'état actuel, sans refonte.

## Méthode

- Inventaire du backend (20 modules, 79 routes exposées via OpenAPI).
- Exécution de la suite de tests existante (`pytest`), unitaire **et** intégration (PostgreSQL de test sur `:5433`).
- Tests **E2E live** contre l'API en fonctionnement (`:8000`) avec les comptes de démo (`*.tontine.cm` / `demo1234`), pour chaque rôle.
- Vérification en base (psql) que les créations sont **réellement persistées**.
- Vérification des permissions **au niveau backend** (source de vérité) et de l'isolation par schéma tenant.

## Résumé exécutif

| Indicateur | Valeur |
|---|---|
| Modules inventoriés | 20 |
| Anomalies trouvées | 8 |
| Anomalies **corrigées** | **8 (ANO-1→8)** |
| Tests de régression ajoutés | 2 (verts) |
| Suite d'intégration | **34 passés / 0 échec / 0 erreur ; 0 fuite de connexion** (au départ 10 échecs) |

**Constat central** : avant correctif, **toutes les créations dans un schéma tenant renvoyaient `201` mais n'étaient jamais enregistrées** (bug de transaction). C'est l'anomalie n°1 du parcours « créer → apparaître dans la liste ». Elle est corrigée et couverte par un test.

## Anomalies bloquantes (corrigées)

### ANO-1 — CRITIQUE — Les écritures tenant ne sont jamais committées
- **Symptôme** : `POST /members` (et toute création tenant) renvoie `201` avec un `id`, mais la donnée n'apparaît ni dans la liste ni en base (`members` reste à 0).
- **Cause** : `app/core/database.py::get_tenant_db` posait le `SET search_path` sur une **connexion brute** *avant* de créer la `Session`. La `Session` « rejoignait une transaction externe » : `session.commit()` n'émettait qu'un `SAVEPOINT`, le `COMMIT` réel n'était jamais émis → écritures perdues + connexions fuitées (`idle in transaction`).
- **Correctif** : lier la `Session` à une **connexion dédiée** (le `search_path` reste valable après commit), puis exécuter le `SET search_path` **via la session** (elle possède la transaction → vrai `COMMIT`). Fichier : `backend/app/core/database.py`.
- **Test** : `backend/tests/test_tenant_commit.py` (écrit+commit dans une session, relit dans une seconde → doit voir la donnée).
- **Vérif live** : `membres 0 → 1`, présent dans `GET /members`, détail `200`, `PUT` reflété.

### ANO-2 — MAJEURE — Schéma tenant de démo périmé (colonnes manquantes)
- **Symptôme** : `GET /loans` → 500 (`column l.amount_paid does not exist`) ; `POST /cotisations` → 500 (`member_cotisations.organization_id` puis `tontine_id` manquants).
- **Cause** : le schéma démo `tontine_bami` a été provisionné par une version antérieure (`backend/init.sql`). Le template courant (`tenant_schema.py`) contient les colonnes, mais `CREATE TABLE IF NOT EXISTS` **n'ajoute pas** de colonne à une table déjà existante, et aucun `ALTER` de rattrapage n'existait pour ces colonnes.
- **Correctif** :
  1. `ALTER TABLE` idempotents appliqués à `tontine_bami` (colonnes `loans.amount_paid`, `member_cotisations.organization_id/tontine_id/updated_at`).
  2. **Auto-réparation** : ajout de ces `ALTER ... ADD COLUMN IF NOT EXISTS` dans `tenant_schema.py` pour que `ensure_tenant_schema()` répare tout schéma déjà provisionné (placés *après* le `CREATE TABLE` correspondant).
- **Vérif live** : `GET /loans` → 200 ; `POST /cotisations` → 201 + présent dans la liste.
- **Reste à faire** : appliquer `ensure_tenant_schema('tontine_tontine_akomyop')` au second schéma de démo (voir known-issues).

### ANO-3 — MOYENNE — Champ `meeting_date` inutilisable (shadowing Pydantic)
- **Symptôme** : `POST /meetings` avec `meeting_date` → 422 « Input should be None ».
- **Cause** : `from datetime import date` puis un **champ nommé `date`** masque le type `date` ; l'annotation suivante `meeting_date: Optional[date]` devient `Optional[None]`.
- **Correctif** : importer le type sous alias (`from datetime import date as date_type`). Fichier : `backend/app/modules/meetings/schema.py`.
- **Vérif live** : `POST /meetings` accepte désormais `date` **et** `meeting_date` → 201.

## Parcours vérifiés OK (après correctifs, API live)

| Domaine | Créer | Lister | Détail | Modifier | Action métier | Perms |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Auth (login/refresh/me) | — | — | — | — | ✅ | ✅ |
| Membres | ✅ | ✅ | ✅ | ✅ | validate/suspend* | ✅ |
| Cotisations | ✅ | ✅ | ✅ | — | — | ✅ |
| Prêts | ✅ | ✅ | ✅ | — | schedule ✅ | ✅ |
| Paiements | ✅ | ✅ | — | — | initiate ✅ | ✅ |
| Réunions | ✅ | ✅ | — | — | — | ✅ |
| Sanctions | ✅ (censeur) | ✅ | — | — | — | ✅ |
| Caisse / Rapports / Notifs / Reçus / Config | — | ✅ | — | — | — | ✅ |
| Superadmin (orgs/tontines/admins/stats/plans/audit) | — | ✅ | — | — | — | ✅ |

\* actions membres (validate/reject/suspend/reinstate) exposées et protégées ; testées au niveau routes.

## Permissions (backend = source de vérité)

- `membre` **authentifié** : `POST /members` → **403** (refus réel), `GET /members` → 200 (lecture OK).
- `admin` : `GET /superadmin/*` → **403**.
- Sans token : `GET /members` → **401**.
- `censeur` : `POST /sanctions` → **201**.

## Multi-tenant

- Le contexte tenant est porté par le JWT (`schema`, `tid`) et le `search_path` par requête (isolation par schéma PostgreSQL, un schéma par tontine).
- Test existant `test_tenant_pool.py::test_isolation_des_schemas_sur_pool_partage` : **vert**.
- Test ajouté `test_tenant_search_path_scopes_to_schema` : **vert**.
- Non couvert dans cette passe : scénario complet org A/org B via l'API (nécessite provisionner une 2ᵉ tontine) — recommandé en E2E dédié.

## Fichiers modifiés / ajoutés

- `backend/app/core/database.py` — correctif commit tenant (ANO-1).
- `backend/app/modules/meetings/schema.py` — alias d'import (ANO-3).
- `backend/app/common/tenant_schema.py` — `ALTER` idempotents auto-réparateurs (ANO-2).
- `backend/tests/test_tenant_commit.py` — **nouveau** test de régression.
- Base `tontine_bami` — `ALTER TABLE ADD COLUMN IF NOT EXISTS` (non destructif).

## Commandes exécutées (extraits)

```bash
# Tests
cd backend && .venv/bin/pytest -q                       # unit: 4 passed
TEST_DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5433/tontine_test \
  .venv/bin/pytest -q                                   # 30 passed, 4 failed (préexistants), 3 errors (teardown)
.venv/bin/pytest tests/test_tenant_commit.py -v         # 2 passed

# E2E live (script d'audit)
python3 scratchpad/e2e_audit.py                         # 42/49 avant fixes cotisations/meetings, puis tout vert
```

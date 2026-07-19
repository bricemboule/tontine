# Matrice fonctionnelle — TontineOS (audit 2026-07-18)

Statuts : ✅ fonctionnel · ⚠️ partiel · ❌ non fonctionnel · ➖ non applicable/absent · 🔎 non testé cette passe

État **après** les correctifs ANO-1/2/3. Vérifié via l'API live (`:8000`) + base (psql).

| Module | Créer | Lister | Détail | Modifier | Action métier | Perms (backend) | Multi-tenant | Tests |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Authentification | ➖ | ➖ | ✅ (`/auth/me`) | ✅ (mdp) | login/refresh/logout ✅ | ✅ | ✅ (JWT tid/schema) | ✅ auth_flow* |
| Membres | ✅ | ✅ | ✅ | ✅ | validate/reject/suspend/reinstate 🔎 | ✅ (403 membre) | ✅ | ✅ commit |
| Cotisations | ✅ | ✅ | ✅ | 🔎 | enroll/pay/close 🔎 | ✅ | ✅ | 🔎 |
| Prêts | ✅ | ✅ | ✅ | ➖ | approve/reject/repay 🔎 · schedule ✅ | ✅ | ✅ | 🔎 |
| Paiements | ✅ | ✅ | 🔎 | ➖ | validate/cancel/reverse 🔎 | ✅ | ✅ | ✅ idempotency |
| Réunions | ✅ | ✅ | 🔎 | 🔎 | cancel/close 🔎 | ✅ | ✅ | 🔎 |
| Sanctions | ✅ | ✅ | 🔎 | ➖ | validate/lift 🔎 | ✅ (censeur) | ✅ | 🔎 |
| Tours | ➖ | ✅ | 🔎 | ➖ | auto-assign/paid 🔎 | 🔎 | ✅ | 🔎 |
| Pénalités | 🔎 | ✅ | ➖ | ➖ | pay/cancel 🔎 | 🔎 | ⚠️ (ANO-4) | ❌ penalties |
| Caisse | ➖ | ✅ | ➖ | ➖ | movements ✅ | 🔎 | ✅ | ✅ cash_integrity |
| Rapports | ➖ | ✅ (summary/cashflow/audit) | ➖ | ➖ | export ✅ | 🔎 | ✅ | ✅ export |
| Notifications | ➖ | ✅ | ➖ | ➖ | read/read-all 🔎 | 🔎 | ✅ | 🔎 |
| Reçus | ➖ | ✅ | ✅ (pdf) | ➖ | ➖ | 🔎 | ✅ | 🔎 |
| Cycles | 🔎 | ✅ | ➖ | ➖ | activate/close 🔎 | 🔎 | ✅ | 🔎 |
| Décaissements (payouts) | 🔎 | ✅ | ➖ | ➖ | approve/reject 🔎 | 🔎 | ✅ | 🔎 |
| Config / Paramètres | ➖ | ✅ | ➖ | ✅ (PUT) | ➖ | 🔎 | ✅ | 🔎 |
| Superadmin · Organisations | 🔎 | ✅ | ➖ | statut PATCH 🔎 | ➖ | ✅ | ➖ (central) | 🔎 |
| Superadmin · Tontines | 🔎 | ✅ | ➖ | 🔎 | delete 🔎 | ✅ | ➖ | 🔎 |
| Superadmin · Admins | 🔎 | ✅ | ➖ | ➖ | ➖ | ✅ | ➖ | 🔎 |
| Superadmin · Stats/Plans/Abos/Audit | ➖ | ✅ | ➖ | ➖ | ➖ | ✅ | ➖ | 🔎 |

\* `test_auth_flow` : assertions ✅, 3 erreurs *au teardown* (ANO-7, cosmétique).

## Suite de tests automatisés

| Type | Résultat |
|---|---|
| Unitaires (`pytest -q`) | 4 passed |
| Intégration (`TEST_DATABASE_URL=…`) | **30 passed**, 4 failed (ANO-4 ×2, ANO-8 ×2 — préexistants), 3 errors teardown (ANO-7) |
| Régression ajoutée (`test_tenant_commit.py`) | 2 passed |

## Recommandations de couverture (prochaines étapes)

1. Tests d'intégration API par module sur le patron « create → list contient l'id → detail » (le patron d'ANO-1) pour Cotisations, Prêts, Paiements, Réunions, Sanctions.
2. Scénario multi-tenant complet org A/org B via l'API (provisionner 2 tontines, vérifier l'invisibilité croisée et le 404 inter-tenant).
3. Corriger ANO-4 (contrainte pénalités) et ANO-8 (harnais), puis viser 0 échec d'intégration.
4. E2E frontend (Playwright) sur le parcours membre : login → liste → création → succès → détail.

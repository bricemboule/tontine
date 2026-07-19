# Anomalies connues — TontineOS (audit 2026-07-18)

## Corrigées

| ID | Sévérité | Résumé | Statut |
|---|---|---|---|
| ANO-1 | Critique | Écritures tenant jamais committées (`get_tenant_db`) | ✅ Corrigé + test |
| ANO-2 | Majeure | Schéma tenant démo périmé (colonnes manquantes) | ✅ Corrigé + auto-réparation |
| ANO-3 | Moyenne | `MeetingCreate` : `meeting_date` inutilisable (shadowing) | ✅ Corrigé |
| ANO-4 | Majeure | Génération pénalités de retard cassée (`ON CONFLICT` sur index partiel) | ✅ Corrigé + tests verts |
| ANO-5 | Majeure | 2ᵉ schéma démo `tontine_tontine_akomyop` périmé | ✅ Ré-synchronisé |
| ANO-6 | Moyenne | Fuite de connexions sur les sessions tenant | ✅ Corrigé (`_TenantSession.close()`) |
| ANO-7 | Mineure | Teardown test : FK `audit_logs → users` | ✅ Corrigé (purge ordonnée) |
| ANO-8 | Moyenne | Sweep mobile money s'abortait sur un intent invalide | ✅ Durci (try/except par intent) |

Détails : voir `functional-audit.md`. **Suite d'intégration : 34 passés / 0 échec / 0 erreur ; 0 warning de fuite de connexion.**

### ANO-4 — Pénalités : `ON CONFLICT` incompatible avec un index partiel (corrigé)
- **Cause** : `cotisations/repository.py` faisait `ON CONFLICT (reference_type, reference_id)` alors que l'index d'unicité est **partiel** (`WHERE reference_type IS NOT NULL`) — PostgreSQL exige le même prédicat pour l'inférer.
- **Correctif** : ajout du prédicat `WHERE reference_type IS NOT NULL` à la clause `ON CONFLICT`. Seed de `test_penalties.py` complété (organization_id/tontine_id, comme le fait `enroll_active_members` en prod).
- **Impact** : la génération automatique des pénalités de retard fonctionne désormais (elle échouait totalement — non détecté car ces tests d'intégration étaient *skippés* faute de `TEST_DATABASE_URL`).

### ANO-8 — Sweep mobile money non résilient (corrigé)
- **Cause** : `sweep_stuck_mobile_payments` appelait `reconcile_mobile_payment` **hors** try/except ; un `payment_intent` pointant vers un schéma disparu faisait échouer tout le balayage (cron).
- **Correctif** : chaque réconciliation est protégée (log + poursuite). Hygiène : purge des `payment_intents` orphelins de la base de test.

### ANO-6 — Fuite de connexions sur les sessions tenant (corrigé)
- **Symptôme** : warnings SQLAlchemy « The garbage collector is trying to clean up non-checked-in connection ».
- **Cause** : `get_tenant_db` lie la session à une connexion obtenue manuellement (`engine.connect()`) ; `AsyncSession.close()` **ne referme pas** la connexion sous-jacente → elle reste détenue hors du pool.
- **Correctif** : sous-classe `_TenantSession` dont `close()` referme la connexion dédiée après `super().close()`. Aucun des 85 appelants n'est modifié (ils font déjà `await db.close()`). Vérifié : **0 warning** de fuite sur la suite d'intégration.

### ANO-7 — Teardown des tests : violation de clé étrangère (corrigé)
- **Cause** : le nettoyage de `test_auth_flow.py` supprimait des `users` encore référencés par `audit_logs` (FK sans cascade).
- **Correctif** : purge de `audit_logs` avant `users` dans le teardown.

## Points d'attention (INFO)

### RL-1 — Rate limiter de login agressif / partage de bucket
- `slowapi` avec `key_func=get_remote_address`. Derrière un reverse-proxy **sans** `X-Forwarded-For` de confiance, toutes les requêtes présentent l'IP du proxy → **un seul bucket partagé** pour tous les utilisateurs (risque de blocage collectif). En développement, bloque les tests enchaînant plusieurs logins (429).
- **Reco** : configurer la confiance proxy (`ProxyHeadersMiddleware` / `X-Forwarded-For`) et vérifier la fenêtre/quantité du quota de login.

### DATA-1 — Utilisateurs orphelins de test
- Les tentatives de création de membre **avant** le correctif ANO-1 ont laissé des lignes dans `public.users` / `public.tontine_members` sans membre tenant correspondant.
- **Reco** : purge ciblée des comptes `*@x.cm` / `audit.test@*` créés pendant l'audit si besoin (non destructif pour les données réelles).

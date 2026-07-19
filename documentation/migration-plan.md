# Plan de Migration

La migration doit rester progressive. Ne pas refaire l'application en une seule
opération.

## Terminé

- `main.py` allégé.
- Modules backend créés sous `backend/app/modules`.
- Helpers communs déplacés sous `backend/app/common`.
- Bootstrap SaaS déplacé sous `backend/app/core/bootstrap.py`.
- Mobile Money déplacé sous `backend/app/integrations/mobile_money`.
- `saas_mvp.py` réduit à une façade legacy ; les wrappers historiques vivent dans `app/api/legacy.py`.
- `mvp_schemas.py` réduit à une façade legacy ; les ré-exports historiques vivent dans `app/api/legacy_schemas.py`.
- Tests backend découplés de `saas_mvp.py`.

## Prochaines étapes backend

1. Remplacer progressivement les noms legacy anglais dans les signatures internes.
2. Remplacer `require_roles` par `require_permission` module par module.
3. Auditer les repositories SQL brut pour le multi-tenant.
4. Ajouter des tests de permissions et d'isolation tenant.
5. Extraire les schémas globaux restants de `schemas.py` vers les modules.
6. Mettre à jour les routes `/api/v1` sans casser les routes existantes.
7. Nettoyer les dossiers legacy vides `backend/routers` et `backend/services`.

## Prochaines étapes frontend

1. Centraliser le client API.
2. Réorganiser `src/` par fonctionnalités.
3. Ajouter un système frontend de permissions basé sur les permissions backend.
4. Découper les pages volumineuses.
5. Ajouter des tests sur les routes protégées et les actions critiques.

## Validation après chaque étape

```bash
npm run test:backend
npm run lint
npm run build
```

Pour les tests avec base PostgreSQL :

```bash
npm run db:up
npm run db:test:create
npm run test:backend:integration
```

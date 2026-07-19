# Structure Frontend

Le frontend est encore organisé principalement sous `src/`. La migration vers une
structure par fonctionnalités doit rester progressive.

## État actuel

```text
src/
├── app/
│   ├── permissions.js
│   ├── providers.jsx
│   └── router.jsx
├── api/
│   ├── http.js
│   ├── mockData.js
│   └── client.js
├── components/
├── contexts/
│   └── AuthContext.jsx
├── features/
│   └── auth/
│   └── admin/
│   └── censeur/
│   └── dashboards/
│   └── membre/
│   └── president/
│   └── secretaire/
│   └── shared/
│   └── superadmin/
│   └── tresorier/
├── hooks/
│   └── useApi.js
├── layouts/
└── routes/
```

## Responsabilités

- `src/api/http.js` : transport HTTP, stockage token, refresh helpers, erreurs API.
- `src/api/mockData.js` : données mock et helpers utilisés quand `VITE_USE_MOCK=true`.
- `src/api/client.js` : façade qui compose les clients API de chaque domaine.
- `src/app/providers.jsx` : providers globaux de l'application.
- `src/app/router.jsx` : routes React et gardes d'accès par rôle.
- `src/app/permissions.js` : règles frontend de redirection et d'accès par rôle.
- `src/hooks/useApi.js` : injecte le client API avec le contexte auth.
- `src/contexts/AuthContext.jsx` : état de session React, login, logout, refresh, changement de tontine.
- `src/features/auth` : page et composants de connexion.
- `src/features/auth/hooks/useGoogleLogin.js` : chargement Google Identity Services et connexion OAuth.
- `src/features/auth/constants.js` : routes de redirection après connexion.
- `src/features/<role>` : pages métier par rôle, migrées depuis `src/pages/<role>`.
- `src/features/<domaine>/api.js` : endpoints API par domaine métier.
- `src/features/cotisations/components/*` : composants communs aux écrans de cotisation utilisés par plusieurs rôles
  (statistiques, bénéficiaires, inscription, paiement).
- `src/features/prets/components/*` : composants communs aux écrans de détail de prêt
  (statistiques, progression, échéancier, modales).
- `src/features/shared/index.jsx` : façade d'exports pour les pages partagées.
- `src/features/shared/pages/*` : écrans partagés découpés par responsabilité
  (`MembersPage`, `LoansPage`, `PaymentsPage`, etc.).
- `src/features/shared/ActorDashboardHomes.jsx` : façade de compatibilité pour les accueils par rôle.
- `src/features/shared/dashboard-home/*` : composants et accueils de dashboard par rôle.
- `src/features/shared/SaaSMvp.jsx` : façade de compatibilité pour les pages SaaS partagées.
- `src/features/shared/saas-mvp/*` : pages SaaS partagées séparées
  (`OrganizationsPage`, `CashPage`, `PenaltiesPage`, etc.).
- `src/features/superadmin/Dashboard.jsx` : orchestration de l'espace super administrateur.
- `src/features/superadmin/components/*` et `pages/*` : onglets et écrans internes du super administrateur.
- `src/components/ui/index.jsx` : façade d'exports des composants UI partagés.
- `src/components/ui/*` : styles partagés, formatage, calculs, hook et composants UI réutilisables.

## Règles

- Ne pas appeler `fetch` directement dans les composants.
- Ajouter les nouveaux endpoints dans `src/features/<domaine>/api.js`.
- Garder `src/api/client.js` comme façade de composition, pas comme fichier métier.
- Utiliser l'alias `@` pour les imports transverses : `@/hooks/useApi`, `@/components/ui/index`, `@/layouts/...`.
- Garder les imports relatifs courts uniquement pour les fichiers du même module.
- Garder `src/App.jsx` comme point de composition léger.
- Garder `AuthContext` centré sur l'état de session, pas sur les détails HTTP.
- Garder les écrans partagés séparés dans `src/features/shared/pages` au lieu
  d'empiler plusieurs pages dans un seul fichier.
- Le frontend peut masquer une action selon le rôle ou la permission, mais le backend reste la source de vérité.

## Migration recommandée

1. Migrer une fonctionnalité à la fois, par exemple `members`, puis `cotisations`.
3. Garder les routes existantes pendant la migration.
4. Déplacer les composants partagés vers `src/components`.
5. Centraliser les permissions frontend dans un helper dédié quand le backend expose une liste complète de permissions.

## Compatibilité

Les anciens wrappers `src/pages/*` et `src/components/auth/*` ont été supprimés.
Les routes et imports doivent utiliser `src/features/*`.

## Nettoyage Effectué

- Suppression de `src/pages/`, qui ne contenait plus que des wrappers vers
  `src/features/*`.
- Suppression de composants legacy non importés (`RoleSelector`, anciens
  boutons/form fields Laravel-like, anciens blocs landing page).
- Suppression des dossiers frontend vides après migration.
- Découpage de `src/components/ui/index.jsx` en fichiers ciblés pour éviter un
  module partagé trop volumineux.

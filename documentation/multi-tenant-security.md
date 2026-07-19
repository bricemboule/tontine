# Sécurité Multi-Tenant

## Stratégie actuelle

Le backend utilise :

- un schéma central public pour les utilisateurs, organisations, registre des tontines et abonnements ;
- un schéma PostgreSQL par tontine pour les données opérationnelles ;
- un `schema_name` présent dans le JWT ou le contexte utilisateur ;
- `app.common.tenant.tenant_context` pour résoudre le contexte actif.

## Contexte tenant

Le contexte contient notamment :

- `tontine_id`
- `tontine_name`
- `slug`
- `schema_name`
- `organization_id`
- `organization_name`
- `organization_status`

Un utilisateur non super administrateur doit être actif dans la tontine ou
administrateur assigné. Une organisation suspendue bloque l'accès.

## Règles obligatoires

- Ne jamais accepter un `schema_name` arbitraire depuis le body.
- Toujours résoudre le tenant depuis l'utilisateur courant et la base centrale.
- Les requêtes tenant doivent utiliser `get_tenant_db(ctx["schema_name"])`.
- Les routes globales doivent être réservées au super administrateur.
- Les exports doivent utiliser le contexte tenant courant.

## Risques restants

- Plusieurs repositories utilisent encore du SQL brut. Il faut auditer
  progressivement les filtres `organization_id`, `tontine_id` et `member_id`.
- Certains contrôles de propriété membre sont encore dans les services.
- Les permissions sont encore principalement basées sur le rôle courant.

# Transactions Financières

## Concepts actuels

Le projet manipule actuellement :

- cotisations ;
- paiements ;
- mouvements de caisse ;
- reçus ;
- pénalités ;
- prêts ;
- décaissements ;
- remboursements.

Les helpers financiers communs sont dans `backend/app/common/cash.py` :

- `get_cash_balance`
- `lock_cash_balance`
- `add_cash_movement`

## Règles à respecter

- Une opération financière validée ne doit pas être supprimée physiquement.
- Toute annulation doit être explicite et justifiée.
- Toute écriture sensible doit créer un audit.
- Les opérations complexes doivent être atomiques.
- Les écritures de caisse doivent passer par `add_cash_movement`.
- Les doubles paiements doivent être protégés par l'idempotence quand une clé est disponible.

## À renforcer

- Séparer progressivement :
  - obligation métier ;
  - paiement métier ;
  - transaction prestataire ;
  - écriture de caisse ;
  - reçu ;
  - remboursement.
- Ajouter des tests d'échec transactionnel.
- Ajouter des tests de remboursement, contrepassation et double webhook.
- Renforcer les contraintes DB sur les références financières.

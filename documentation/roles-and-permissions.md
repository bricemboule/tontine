# Rôles et Permissions

Les permissions sont centralisées dans `backend/app/core/permissions.py`.

## Rôles fonctionnels

- `superadmin`
- `admin`
- `president`
- `secretaire`
- `tresorier`
- `censeur`
- `membre`

Le rôle `commissaire aux comptes` est prévu fonctionnellement, mais il faut
vérifier sa présence exacte dans `models.UserRole` avant de l'exposer partout.

## Principe

Le backend reste la source de vérité. Le frontend peut masquer une action, mais
ne doit jamais remplacer le contrôle backend.

Utiliser :

```python
from app.core.permissions import require_permission

current_user = Depends(require_permission("payment.validate"))
```

## Points à améliorer

- Remplacer progressivement les dépendances `require_roles(...)` par des
  permissions précises.
- Ajouter des tests dédiés aux permissions sensibles.
- Auditer les permissions financières :
  - validation paiement ;
  - annulation paiement ;
  - reversement ;
  - décaissement ;
  - remboursement prêt ;
  - paiement pénalité.
- Ajouter l'audit à toute attribution ou suppression de rôle.

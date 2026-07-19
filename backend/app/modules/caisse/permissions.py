from fastapi import Depends

from app.core.permissions import require_permission


peut_lire_caisse = Depends(require_permission("cash_account.read"))

from fastapi import Depends

from app.core.permissions import require_permission


peut_creer_penalite = Depends(require_permission("penalite.create"))
peut_payer_penalite = Depends(require_permission("penalite.pay"))
peut_annuler_penalite = Depends(require_permission("penalite.cancel"))

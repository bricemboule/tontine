from fastapi import Depends

from app.core.permissions import require_permission


peut_creer_sanction = Depends(require_permission("sanction.create"))
peut_valider_sanction = Depends(require_permission("sanction.validate"))
peut_lever_sanction = Depends(require_permission("sanction.lift"))

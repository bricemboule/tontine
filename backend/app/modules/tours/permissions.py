from fastapi import Depends

from app.core.permissions import require_permission


peut_generer_tours = Depends(require_permission("tour.generate"))
peut_payer_tour = Depends(require_permission("tour.pay"))

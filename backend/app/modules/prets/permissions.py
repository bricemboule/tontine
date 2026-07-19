from fastapi import Depends

from app.core.permissions import require_permission


peut_creer_pret = Depends(require_permission("pret.create"))
peut_approuver_pret = Depends(require_permission("pret.approve"))
peut_rejeter_pret = Depends(require_permission("pret.reject"))
peut_rembourser_pret = Depends(require_permission("pret.repay"))

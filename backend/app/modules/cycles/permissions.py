from fastapi import Depends

from app.core.permissions import require_permission
from app.core.security import get_current_user


utilisateur_connecte = Depends(get_current_user)
peut_creer_cycle = Depends(require_permission("cycle.create"))
peut_activer_cycle = Depends(require_permission("cycle.activate"))
peut_cloturer_cycle = Depends(require_permission("cycle.close"))

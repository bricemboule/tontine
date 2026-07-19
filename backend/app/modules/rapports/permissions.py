from fastapi import Depends

from app.core.permissions import require_permission
from app.core.security import get_current_user


peut_lire_rapport = Depends(require_permission("rapport.read"))
peut_exporter_rapport = Depends(require_permission("rapport.export"))
utilisateur_connecte = Depends(get_current_user)

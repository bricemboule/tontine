from fastapi import Depends

from app.core.permissions import require_permission
from app.core.security import get_current_user


utilisateur_connecte = Depends(get_current_user)
peut_modifier_parametres = Depends(require_permission("parametres.update"))

from fastapi import Depends

from app.core.permissions import require_permission


peut_gerer_plateforme = Depends(require_permission("platform.manage"))
peut_lire_audit_global = Depends(require_permission("audit.read_global"))

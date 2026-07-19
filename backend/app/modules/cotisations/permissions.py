from fastapi import Depends

from app.core.permissions import require_permission


can_create_cotisation = Depends(require_permission("cotisation.create"))
can_update_cotisation = Depends(require_permission("cotisation.update"))
can_validate_cotisation = Depends(require_permission("cotisation.validate"))

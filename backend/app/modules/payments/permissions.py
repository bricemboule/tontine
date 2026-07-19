from fastapi import Depends

from app.core.permissions import require_permission


can_create_payment = Depends(require_permission("payment.create"))
can_validate_payment = Depends(require_permission("payment.validate"))
can_cancel_payment = Depends(require_permission("payment.cancel"))
can_reverse_payment = Depends(require_permission("payment.reverse"))

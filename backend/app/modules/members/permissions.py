from fastapi import Depends

from app.core.permissions import require_permission


can_create_member = Depends(require_permission("member.create"))
can_update_member = Depends(require_permission("member.update"))
can_validate_member = Depends(require_permission("member.validate"))
can_suspend_member = Depends(require_permission("member.suspend"))
can_offboard_member = Depends(require_permission("member.offboard"))
can_read_outstanding = Depends(require_permission("member.outstanding.read"))


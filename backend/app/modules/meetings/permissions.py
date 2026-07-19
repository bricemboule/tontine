from fastapi import Depends

from app.core.permissions import require_permission


can_create_meeting = Depends(require_permission("meeting.create"))
can_read_meeting = Depends(require_permission("meeting.read"))
can_update_meeting = Depends(require_permission("meeting.update"))
can_cancel_meeting = Depends(require_permission("meeting.cancel"))
can_close_meeting = Depends(require_permission("meeting.close"))


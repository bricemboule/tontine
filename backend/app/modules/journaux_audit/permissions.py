from fastapi import Depends

from app.core.permissions import require_permission


peut_lire_journal_audit = Depends(require_permission("audit.read"))

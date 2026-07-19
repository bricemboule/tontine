from fastapi import Depends

from app.core.permissions import require_permission


peut_lire_tableau_admin = Depends(require_permission("tableau_bord.admin.read"))
peut_lire_tableau_membre = Depends(require_permission("tableau_bord.member.read"))

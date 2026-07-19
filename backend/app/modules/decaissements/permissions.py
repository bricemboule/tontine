from fastapi import Depends

from app.core.permissions import require_permission


peut_lire_decaissements = Depends(require_permission("decaissement.read"))
peut_creer_decaissement = Depends(require_permission("decaissement.create"))
peut_approuver_decaissement = Depends(require_permission("decaissement.approve"))
peut_rejeter_decaissement = Depends(require_permission("decaissement.reject"))

"""
Point d'entrée compatible FastAPI de TontineOS.

La création réelle de l'application vit dans `app.core.application`.
Ce fichier conserve aussi quelques exports historiques utilisés par les tests
et anciens scripts.
"""
import logging

from app.common.finance import calc_loan, calc_penalty
from app.core.application import assert_safe_config, create_app, lifespan
from app.core.config import ENVIRONMENT, SECRET_KEY
from app.core.database import (
    DATABASE_URL,
    dispose_engines,
    get_central_db,
    get_central_engine,
    get_tenant_db,
    get_tenant_engine,
    make_engine,
)
from app.core.models import (
    Base,
    PaymentMethod,
    RefreshToken,
    SanctionStatus,
    TontineAdminAssignment,
    TontineMember,
    TontineRegistry,
    TontineStatus,
    TontineType,
    User,
    UserRole,
)
from app.core.security import hash_password, limiter
from app.modules.auth.session import (
    get_user_memberships,
    resolve_active_context,
    sync_demo_accounts,
)

logging.basicConfig(level=logging.INFO)

app = create_app()

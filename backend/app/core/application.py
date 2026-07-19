import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded

from app.api.router import include_app_routers
from app.core.bootstrap import ensure_saas_schema
from app.core.config import ENVIRONMENT, SECRET_KEY
from app.core.database import dispose_engines
from app.core.security import limiter
from app.modules.auth.session import sync_demo_accounts

logger = logging.getLogger(__name__)

DEFAULT_SECRET_KEYS = {
    "CHANGE_ME_32_CHARS_MINIMUM_DO_NOT_USE_IN_PROD",
    "CHANGE_ME_IN_PRODUCTION",
}


def assert_safe_config() -> None:
    if ENVIRONMENT == "development":
        return
    if SECRET_KEY in DEFAULT_SECRET_KEYS or len(SECRET_KEY) < 32:
        raise RuntimeError(
            "SECRET_KEY absente/par défaut/trop courte en environnement "
            f"'{ENVIRONMENT}'. Générez-la avec `openssl rand -hex 32`."
        )


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("TontineOS API démarrage (env=%s)", ENVIRONMENT)
    assert_safe_config()
    await sync_demo_accounts()
    await ensure_saas_schema()
    yield
    logger.info("TontineOS API arrêt")
    await dispose_engines()


def add_rate_limit_handler(app: FastAPI) -> None:
    app.state.limiter = limiter
    app.add_exception_handler(
        RateLimitExceeded,
        lambda request, exc: JSONResponse(
            {"detail": "Trop de tentatives — réessayez dans quelques instants"},
            status_code=429,
        ),
    )


def add_cors(app: FastAPI) -> None:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:4173",
            "https://tontineos.cm",
        ],
        allow_origin_regex=r"^http://(localhost|127\.0\.0\.1):\d+$",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


def add_health_routes(app: FastAPI) -> None:
    @app.get("/health", tags=["Santé"])
    async def health():
        return {"status": "ok", "version": "2.0.0", "service": "TontineOS API"}

    @app.get("/", tags=["Santé"])
    async def root():
        return {
            "service": "Tontine API v2",
            "docs": "/docs",
            "health": "/health",
        }


def create_app() -> FastAPI:
    app = FastAPI(
        title="TontineOS API",
        version="2.0.0",
        description="Plateforme SaaS multi-tenant de gestion des tontines — Architecture PostgreSQL par schéma",
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
    )
    add_rate_limit_handler(app)
    add_cors(app)
    include_app_routers(app)
    add_health_routes(app)
    return app

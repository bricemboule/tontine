"""Configuration partagee du backend TontineOS."""
from pathlib import Path
import os

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parents[2]
ROOT_DIR = BASE_DIR.parent

# Charge d'abord le .env racine (Docker/Vite), puis backend/.env si present.
# load_dotenv n'ecrase pas les variables deja exportees par le shell/test runner.
load_dotenv(ROOT_DIR / ".env")
load_dotenv(BASE_DIR / ".env")


def env_bool(name: str, default: bool = False) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


def env_int(name: str, default: int) -> int:
    raw = os.getenv(name)
    if raw is None or raw == "":
        return default
    return int(raw)


DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@localhost:5432/tontine_central",
)
SECRET_KEY = os.getenv("SECRET_KEY", "CHANGE_ME_32_CHARS_MINIMUM_DO_NOT_USE_IN_PROD")
ALGORITHM = "HS256"
ACCESS_TOKEN_TTL = env_int("ACCESS_TOKEN_TTL", 30)
REFRESH_TOKEN_TTL = env_int("REFRESH_TOKEN_TTL", 7)
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
ENABLE_DEMO_DATA = env_bool("ENABLE_DEMO_DATA", False)

REDIS_URL = os.getenv("REDIS_URL", "memory://")
CELERY_REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
ORANGE_WEBHOOK_SECRET = os.getenv("ORANGE_WEBHOOK_SECRET", "")
MTN_WEBHOOK_SECRET = os.getenv("MTN_WEBHOOK_SECRET", "")

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")
ORANGE_TOKEN_URL = os.getenv("ORANGE_TOKEN_URL", "https://api.orange.com/oauth/v3/token")
ORANGE_WEBPAY_URL = os.getenv(
    "ORANGE_WEBPAY_URL",
    "https://api.orange.com/orange-money-webpay/dev/v1/webpayment",
)
ORANGE_CLIENT_ID = os.getenv("ORANGE_CLIENT_ID", "")
ORANGE_CLIENT_SECRET = os.getenv("ORANGE_CLIENT_SECRET", "")
ORANGE_MERCHANT_KEY = os.getenv("ORANGE_MERCHANT_KEY", "")
MTN_COLLECTION_URL = os.getenv("MTN_COLLECTION_URL", "https://sandbox.momodeveloper.mtn.com")
MTN_API_KEY = os.getenv("MTN_API_KEY", "")
MTN_API_USER = os.getenv("MTN_API_USER", "")
MTN_API_SECRET = os.getenv("MTN_API_SECRET", "")
MTN_TARGET_ENV = os.getenv("MTN_TARGET_ENV", "sandbox")

import secrets
import string
import uuid
from datetime import datetime, timedelta

import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import ALGORITHM, REDIS_URL, REFRESH_TOKEN_TTL, SECRET_KEY
from app.core.models import RefreshToken, UserRole


limiter = Limiter(key_func=get_remote_address, storage_uri=REDIS_URL)
oauth2 = OAuth2PasswordBearer(tokenUrl="/auth/login")


def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except ValueError:
        return False


def generate_temporary_password(length: int = 12) -> str:
    alphabet = string.ascii_letters + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(length))


def create_token(payload: dict, ttl: timedelta) -> str:
    data = {**payload, "exp": datetime.utcnow() + ttl}
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            "Token invalide ou expiré",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def create_refresh_token(
    user_id: int,
    db: AsyncSession,
    tontine_id: int | None = None,
) -> str:
    jti = str(uuid.uuid4())
    expires_at = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_TTL)
    db.add(RefreshToken(jti=jti, user_id=user_id, expires_at=expires_at))
    await db.commit()
    payload = {"sub": str(user_id), "type": "refresh", "jti": jti}
    if tontine_id is not None:
        payload["tid"] = tontine_id
    return create_token(payload, timedelta(days=REFRESH_TOKEN_TTL))


async def revoke_all_refresh_tokens(user_id: int, db: AsyncSession) -> None:
    await db.execute(text(
        "UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = :u AND revoked_at IS NULL"
    ), {"u": user_id})
    await db.commit()


async def get_current_user(token: str = Depends(oauth2)) -> dict:
    return decode_token(token)


def require_roles(*roles: UserRole):
    async def dep(current_user: dict = Depends(get_current_user)):
        if current_user.get("role") not in [role.value for role in roles]:
            raise HTTPException(403, f"Rôle requis : {', '.join(role.value for role in roles)}")
        return current_user

    return dep

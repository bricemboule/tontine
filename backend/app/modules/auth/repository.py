from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.models import RefreshToken, User


async def user_par_email(db: AsyncSession, email: str):
    return (await db.execute(select(User).where(User.email == email))).scalar_one_or_none()


async def user_par_email_normalise(db: AsyncSession, email: str):
    return (
        await db.execute(select(User).where(func.lower(User.email) == email))
    ).scalar_one_or_none()


async def user_par_id(db: AsyncSession, user_id: int):
    return (await db.execute(select(User).where(User.id == user_id))).scalar_one_or_none()


async def refresh_token_par_jti(db: AsyncSession, jti: str):
    return (
        await db.execute(select(RefreshToken).where(RefreshToken.jti == jti))
    ).scalar_one_or_none()


async def revoquer_refresh_token(db: AsyncSession, jti: str) -> None:
    await db.execute(text(
        "UPDATE refresh_tokens SET revoked_at = NOW() WHERE jti = :j AND revoked_at IS NULL"
    ), {"j": jti})
    await db.commit()

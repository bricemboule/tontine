"""Configuration des moteurs SQLAlchemy et sessions PostgreSQL."""
import re

from fastapi import HTTPException
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from app.core.config import DATABASE_URL, ENVIRONMENT

TENANT_RE = re.compile(r"^tontine_[a-z0-9_]+$")


def make_engine(url: str = DATABASE_URL):
    options = {
        "pool_pre_ping": True,
        "echo": (ENVIRONMENT == "development"),
    }
    if ENVIRONMENT == "test":
        # asyncpg connections are bound to the event loop where they were created.
        # pytest-asyncio may create one loop per test, so pooling connections across
        # tests can attach Futures to a closed/different loop.
        options["poolclass"] = NullPool
    else:
        options.update({"pool_size": 10, "max_overflow": 20})
    return create_async_engine(url, **options)


_central_engine = None
_tenant_engine = None


def get_central_engine():
    global _central_engine
    if _central_engine is None:
        _central_engine = make_engine()
    return _central_engine


async def get_central_db():
    factory = async_sessionmaker(get_central_engine(), expire_on_commit=False)
    async with factory() as session:
        yield session


def get_tenant_engine():
    global _tenant_engine
    if _tenant_engine is None:
        _tenant_engine = make_engine()
    return _tenant_engine


class _TenantSession(AsyncSession):
    """Session liée à une connexion tenant dédiée.

    `AsyncSession.close()` sur une session liée à une *connexion* ne referme pas
    cette connexion : elle resterait détenue hors du pool (fuite, cf. warnings
    « non-checked-in connection »). On surcharge donc `close()` pour rendre la
    connexion au pool, sans modifier les 85 appelants (qui font déjà
    `await db.close()` en `finally`)."""

    def __init__(self, *args, tenant_connection=None, **kwargs):
        super().__init__(*args, **kwargs)
        self._tenant_connection = tenant_connection

    async def close(self) -> None:
        try:
            await super().close()
        finally:
            connection, self._tenant_connection = self._tenant_connection, None
            if connection is not None:
                await connection.close()


async def get_tenant_db(schema_name: str) -> AsyncSession:
    if not TENANT_RE.match(schema_name):
        raise HTTPException(400, "Nom de schéma invalide")
    # Une connexion DÉDIÉE est réservée pour toute la durée de la session : le
    # `SET search_path` (niveau connexion) reste ainsi valable même après un
    # commit, y compris pour les flux qui enchaînent plusieurs transactions.
    #
    # POINT CLÉ : on lie d'abord la Session à la connexion, PUIS on pose le
    # search_path VIA la session. Ainsi c'est la Session qui ouvre la
    # transaction et session.commit() émet un vrai COMMIT.
    # (Auparavant le `SET` était exécuté sur la connexion brute AVANT le bind :
    #  la Session « rejoignait une transaction externe », commit() ne faisait
    #  qu'un SAVEPOINT, et toutes les écritures tenant étaient perdues.)
    #
    # `_TenantSession.close()` referme la connexion → plus de fuite (ANO-6).
    connection = await get_tenant_engine().connect()
    session = _TenantSession(
        bind=connection, expire_on_commit=False, tenant_connection=connection
    )
    await session.execute(text(f'SET search_path TO "{schema_name}", public'))
    return session


async def dispose_engines() -> None:
    global _central_engine, _tenant_engine
    if _central_engine:
        await _central_engine.dispose()
        _central_engine = None
    if _tenant_engine:
        await _tenant_engine.dispose()
        _tenant_engine = None

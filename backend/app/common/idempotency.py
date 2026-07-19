import json
from typing import Optional

from fastapi.encoders import jsonable_encoder
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def idempotency_lookup(db: AsyncSession, key: Optional[str], scope: str) -> Optional[dict]:
    if not key:
        return None
    row = (await db.execute(text(
        "SELECT response FROM request_idempotency WHERE key = :k AND scope = :s"
    ), {"k": key, "s": scope})).scalar_one_or_none()
    if row is None:
        return None
    return json.loads(row) if isinstance(row, str) else row


async def idempotency_store(db: AsyncSession, key: Optional[str], scope: str, response: dict) -> None:
    if not key:
        return
    await db.execute(text("""
        INSERT INTO request_idempotency (key, scope, response)
        VALUES (:k, :s, CAST(:r AS JSONB))
        ON CONFLICT (key) DO NOTHING
    """), {"k": key, "s": scope, "r": json.dumps(jsonable_encoder(response))})


from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def obtenir_config(db: AsyncSession, schema_name: str):
    return (await db.execute(
        text("SELECT *, :schema AS schema FROM tontine_config LIMIT 1"),
        {"schema": schema_name},
    )).mappings().first()


async def modifier_config(db: AsyncSession, updates: dict) -> None:
    sets = []
    params = {}
    for key, value in updates.items():
        sets.append(f"{key} = :{key}")
        params[key] = value
    await db.execute(text(f"""
        UPDATE tontine_config SET {', '.join(sets)}, updated_at = NOW()
        WHERE id = (SELECT id FROM tontine_config LIMIT 1)
    """), params)

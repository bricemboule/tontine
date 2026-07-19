from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def lister_recus(
    db: AsyncSession,
    user_id: int,
    membre_uniquement: bool,
    page: int,
    limit: int,
):
    return (await db.execute(text(f"""
        SELECT r.*, CONCAT(u.first_name, ' ', u.last_name) AS member_name
        FROM receipts r
        JOIN members m ON m.id = r.member_id
        JOIN public.users u ON u.id = m.user_id
        WHERE {'m.user_id = :uid' if membre_uniquement else 'TRUE'}
        ORDER BY r.created_at DESC
        LIMIT :limit OFFSET :offset
    """), {
        "uid": user_id,
        "limit": limit,
        "offset": (max(page, 1) - 1) * limit,
    })).mappings().all()


async def obtenir_recu_pdf(
    db: AsyncSession,
    recu_id: int,
    user_id: int,
    membre_uniquement: bool,
    nom_tontine: str,
    nom_organisation: str,
):
    return (await db.execute(text("""
        SELECT r.*, CONCAT(u.first_name, ' ', u.last_name) AS member_name,
               :tontine AS tontine_name, :org AS organization_name
        FROM receipts r
        JOIN members m ON m.id = r.member_id
        JOIN public.users u ON u.id = m.user_id
        WHERE r.id = :id
          AND (:member_only = false OR m.user_id = :uid)
    """), {
        "id": recu_id,
        "tontine": nom_tontine,
        "org": nom_organisation,
        "member_only": membre_uniquement,
        "uid": user_id,
    })).mappings().one_or_none()

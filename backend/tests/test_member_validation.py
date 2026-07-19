"""
Régression : la validation d'un membre ne doit pas planter sur une ambiguïté
de type de paramètre.

Bug historique : la requête UPDATE de validate_member (et de
update_central_member_status) réutilisait le paramètre :status à la fois en
affectation (`status = :status`) et en comparaison (`CASE WHEN :status =
'active'`). asyncpg déduisait des types incompatibles pour ce paramètre et
levait « inconsistent types deduced for parameter $1 » — la validation de
membre renvoyait 500 pour tous les rôles. Corrigé par CAST(:status AS VARCHAR).
"""
import pytest
from sqlalchemy import text

from conftest import requires_db
from app.modules.members import repository

pytestmark = requires_db


async def test_validate_member_active(tenant_db):
    db = tenant_db
    member_id = (await db.execute(text("""
        INSERT INTO members (organization_id, tontine_id, user_id, status, role)
        VALUES (1, 1, 990100, 'pending', 'membre')
        RETURNING id
    """))).scalar_one()
    await db.commit()

    # Ne doit PAS lever d'AmbiguousParameterError.
    result = await repository.validate_member(db, member_id, "active", validated_by=1)
    await db.commit()
    assert result is not None

    row = (await db.execute(
        text("SELECT status, joined_at, validated_by FROM members WHERE id = :id"),
        {"id": member_id},
    )).mappings().one()
    assert row["status"] == "active"
    assert row["joined_at"] is not None          # renseigné à l'activation
    assert row["validated_by"] == 1


async def test_reject_member_keeps_no_join_date(tenant_db):
    db = tenant_db
    member_id = (await db.execute(text("""
        INSERT INTO members (organization_id, tontine_id, user_id, status, role)
        VALUES (1, 1, 990101, 'pending', 'membre')
        RETURNING id
    """))).scalar_one()
    await db.commit()

    await repository.validate_member(db, member_id, "rejected", validated_by=2)
    await db.commit()

    row = (await db.execute(
        text("SELECT status, joined_at FROM members WHERE id = :id"),
        {"id": member_id},
    )).mappings().one()
    assert row["status"] == "rejected"
    assert row["joined_at"] is None              # pas de date d'adhésion si rejeté

import logging
import uuid

from fastapi import HTTPException
from sqlalchemy import text

from app.common.audit import audit
from app.common.cash import add_cash_movement
from app.common.formatting import clean_row, clean_rows
from app.common.idempotency import idempotency_lookup, idempotency_store
from app.common.notifications import create_notification
from app.common.payments import normalize_method
from app.common.receipts import create_receipt
from app.modules.cotisations import repository
from app.modules.cotisations.schema import CotisationCreate, CotisationPay
from app.core.database import TENANT_RE, get_central_engine, get_tenant_db
from app.core.models import UserRole

logger = logging.getLogger(__name__)


async def refresh_late_cotisations(db):
    await repository.refresh_late_cotisations(db)


async def apply_late_penalties(db) -> int:
    return await repository.apply_late_penalties(db)


async def sweep_late_penalties_all() -> dict:
    engine = get_central_engine()
    async with engine.begin() as conn:
        schemas = (await conn.execute(text(
            "SELECT schema_name FROM tontine_registry WHERE schema_name IS NOT NULL"
        ))).scalars().all()

    total = 0
    for schema in schemas:
        if not TENANT_RE.match(schema):
            continue
        db = await get_tenant_db(schema)
        try:
            total += await apply_late_penalties(db)
            await db.commit()
        except Exception as exc:  # pragma: no cover - robustesse cron
            await db.rollback()
            logger.warning("Pénalités retard échouées pour %s: %s", schema, exc)
        finally:
            await db.close()
    logger.info("Balayage pénalités: %d créées sur %d schémas", total, len(schemas))
    return {"schemas": len(schemas), "penalties_created": total}


async def list_cotisations(ctx: dict, current_user: dict, status_filter: str | None):
    db = await get_tenant_db(ctx["schema_name"])
    try:
        await refresh_late_cotisations(db)
        member_only = current_user.get("role") == UserRole.MEMBRE.value
        rows = await repository.list_cotisations(
            db,
            status_filter,
            int(current_user["sub"]),
            member_only,
        )
        return clean_rows(rows)
    finally:
        await db.close()


async def create_cotisation(ctx: dict, req: CotisationCreate, current_user: dict):
    db = await get_tenant_db(ctx["schema_name"])
    try:
        cycle_id = req.cycle_id or await repository.active_cycle_id(db)
        row = await repository.create_cotisation(
            db,
            ctx,
            req,
            cycle_id,
            int(current_user["sub"]),
        )
        await repository.enroll_active_members(db, ctx, int(row["id"]), req.amount)
        await repository.create_contribution_rows(
            db,
            ctx,
            cycle_id,
            req.amount,
            req.date_fin,
        )
        await db.commit()
    finally:
        await db.close()

    await audit(current_user, "CREATE_COTISATION", "cotisation", row["id"], {"amount": req.amount})
    data = clean_row(row)
    data["total_inscrits"] = 0
    data["total_paid"] = 0
    data["montant_collecte"] = 0
    return data


async def get_cotisation(ctx: dict, cotisation_id: int):
    db = await get_tenant_db(ctx["schema_name"])
    try:
        await refresh_late_cotisations(db)
        row = await repository.get_cotisation(db, cotisation_id)
        if not row:
            raise HTTPException(404, "Cotisation introuvable")
        members = await repository.list_cotisation_members(db, cotisation_id)
        data = clean_row(row)
        data["members"] = clean_rows(members)
        return data
    finally:
        await db.close()


async def update_cotisation(ctx: dict, cotisation_id: int, req: CotisationCreate):
    db = await get_tenant_db(ctx["schema_name"])
    try:
        row = await repository.update_cotisation(db, cotisation_id, req)
        if not row:
            raise HTTPException(404, "Cotisation introuvable")
        await repository.update_unpaid_member_amounts(db, cotisation_id, req.amount)
        await db.commit()
        return clean_row(row)
    finally:
        await db.close()


async def close_cotisation(ctx: dict, cotisation_id: int):
    db = await get_tenant_db(ctx["schema_name"])
    try:
        row = await repository.close_cotisation(db, cotisation_id)
        if not row:
            raise HTTPException(404, "Cotisation introuvable")
        await db.commit()
        return clean_row(row)
    finally:
        await db.close()


async def enroll_members(ctx: dict, cotisation_id: int, payload: dict):
    member_ids = payload.get("member_ids", [])
    db = await get_tenant_db(ctx["schema_name"])
    try:
        cotisation = await repository.get_cotisation_amount(db, cotisation_id)
        if not cotisation:
            raise HTTPException(404, "Cotisation introuvable")
        enrolled = await repository.enroll_members(
            db,
            ctx,
            cotisation_id,
            float(cotisation["amount"]),
            member_ids,
        )
        await db.commit()
        return {"enrolled": enrolled}
    finally:
        await db.close()


async def unenroll_member(ctx: dict, cotisation_id: int, member_id: int):
    db = await get_tenant_db(ctx["schema_name"])
    try:
        await repository.unenroll_member(db, cotisation_id, member_id)
        await db.commit()
        return {"ok": True}
    finally:
        await db.close()


async def pay_cotisation(
    ctx: dict,
    cotisation_id: int,
    req: CotisationPay,
    current_user: dict,
    idempotency_key: str | None,
):
    db = await get_tenant_db(ctx["schema_name"])
    reference = req.payment_reference or f"TOS-COT-{uuid.uuid4().hex[:8].upper()}"
    method = normalize_method(req.payment_method)
    payment_id = None
    try:
        cached = await idempotency_lookup(db, idempotency_key, "pay_cotisation")
        if cached:
            return cached

        member_cotisation = await repository.member_cotisation_for_payment(db, cotisation_id, req)
        if not member_cotisation:
            raise HTTPException(404, "Cotisation membre introuvable")

        paid = float(member_cotisation["amount_paid"] or 0) + req.amount
        status_value = "paid" if paid >= float(member_cotisation["amount_due"]) else "partial"
        payment_id = await repository.create_cotisation_payment(
            db,
            ctx,
            cotisation_id,
            req,
            reference,
            method,
            member_cotisation["label"],
            int(current_user["sub"]),
        )
        await repository.update_member_cotisation_payment(
            db,
            int(member_cotisation["id"]),
            paid,
            status_value,
        )
        await add_cash_movement(
            db,
            ctx["organization_id"],
            ctx["tontine_id"],
            "income",
            "contribution",
            req.amount,
            member_cotisation["label"],
            "payment",
            payment_id,
            int(current_user["sub"]),
        )
        await create_receipt(
            db,
            ctx["organization_id"],
            ctx["tontine_id"],
            req.member_id,
            payment_id,
            "payment",
            req.amount,
            method,
            reference,
            int(current_user["sub"]),
        )
        await create_notification(
            db,
            req.member_id,
            "Paiement enregistré",
            f"Paiement de {req.amount:,.0f} XAF enregistré.",
            "payment_recorded",
            "/member/payments",
        )
        result = {"id": payment_id, "reference": reference, "status": "success"}
        await idempotency_store(db, idempotency_key, "pay_cotisation", result)
        await db.commit()
    finally:
        await db.close()

    await audit(current_user, "RECORD_PAYMENT", "payment", payment_id, {
        "cotisation_id": cotisation_id,
        "amount": req.amount,
    })
    return result

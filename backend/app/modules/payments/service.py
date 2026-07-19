import logging
import uuid

import httpx
from fastapi import HTTPException
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.common.audit import audit
from app.common.cash import add_cash_movement, lock_cash_balance
from app.common.formatting import clean_rows
from app.common.idempotency import idempotency_lookup, idempotency_store
from app.common.notifications import create_notification
from app.common.payments import normalize_method
from app.common.receipts import create_receipt
from app.modules.payments import repository
from app.modules.payments.schema import PaymentCancel, PaymentCreate
from app.core.config import MTN_API_KEY, MTN_API_SECRET, MTN_API_USER, MTN_COLLECTION_URL, MTN_TARGET_ENV
from app.core.database import TENANT_RE, get_central_engine, get_tenant_db
from app.core.models import UserRole

logger = logging.getLogger(__name__)


async def list_payments(
    ctx: dict,
    current_user: dict,
    pay_status: str | None,
    member_id: int | None,
    page: int,
    limit: int,
):
    db = await get_tenant_db(ctx["schema_name"])
    try:
        member_only = current_user.get("role") == UserRole.MEMBRE.value
        rows = await repository.list_payments(
            db,
            pay_status,
            member_id,
            int(current_user["sub"]),
            member_only,
            page,
            limit,
        )
        return clean_rows(rows)
    finally:
        await db.close()


async def settle_payment_success(
    db: AsyncSession,
    payment,
    organization_id: int,
    tontine_id: int,
    recorded_by: int,
) -> bool:
    if payment["status"] == "success":
        return False
    await repository.mark_payment_success(db, int(payment["id"]), recorded_by)
    if payment["contribution_id"]:
        member_cotisation = await repository.member_cotisation_for_payment(
            db,
            int(payment["contribution_id"]),
            int(payment["member_id"]),
        )
        if member_cotisation:
            paid = float(member_cotisation["amount_paid"] or 0) + float(payment["amount"] or 0)
            status_value = "paid" if paid >= float(member_cotisation["amount_due"]) else "partial"
            await repository.update_member_cotisation_paid(
                db,
                int(member_cotisation["id"]),
                paid,
                status_value,
            )
    await add_cash_movement(
        db,
        organization_id,
        tontine_id,
        "income",
        "contribution",
        float(payment["amount"]),
        payment["description"],
        "payment",
        int(payment["id"]),
        recorded_by,
    )
    await create_receipt(
        db,
        organization_id,
        tontine_id,
        int(payment["member_id"]),
        int(payment["id"]),
        "payment",
        float(payment["amount"]),
        payment["method"],
        payment["reference"],
        recorded_by,
    )
    await create_notification(
        db,
        int(payment["member_id"]),
        "Paiement confirmé",
        f"Votre paiement {payment['reference']} a été confirmé.",
        "payment_confirmed",
        "/member/payments",
    )
    return True


async def reconcile_mobile_payment(reference: str, ok: bool, provider_ref: str | None = None) -> dict:
    factory = async_sessionmaker(get_central_engine(), expire_on_commit=False)
    async with factory() as central:
        intent = (await central.execute(text(
            "SELECT * FROM payment_intents WHERE reference = :r"
        ), {"r": reference})).mappings().one_or_none()
        if not intent:
            return {"matched": False}
        if intent["status"] in ("success", "failed"):
            return {"matched": True, "already": True, "status": intent["status"]}
        schema = intent["schema_name"]

    if not TENANT_RE.match(schema):
        return {"matched": False}

    db = await get_tenant_db(schema)
    try:
        payment = await repository.get_payment_by_reference(db, reference)
        if not payment:
            return {"matched": False}
        if ok:
            await settle_payment_success(
                db,
                payment,
                int(intent["organization_id"]),
                int(intent["tontine_id"]),
                int(payment["member_id"] or 0),
            )
            new_status = "success"
        else:
            await repository.mark_payment_failed(db, int(payment["id"]))
            new_status = "failed"
        await db.commit()
    finally:
        await db.close()

    factory = async_sessionmaker(get_central_engine(), expire_on_commit=False)
    async with factory() as central:
        await central.execute(text("""
            UPDATE payment_intents SET status = :s, provider_ref = COALESCE(:pref, provider_ref),
                completed_at = NOW() WHERE reference = :r
        """), {"s": new_status, "pref": provider_ref, "r": reference})
        await central.commit()
    logger.info("Webhook réconcilié: %s -> %s", reference, new_status)
    return {"matched": True, "status": new_status}


async def check_status_mtn(reference: str) -> str | None:
    if not (MTN_API_KEY and MTN_API_USER and MTN_API_SECRET):
        return None
    async with httpx.AsyncClient(timeout=15.0, base_url=MTN_COLLECTION_URL) as client:
        token_response = await client.post(
            "/collection/token/",
            auth=(MTN_API_USER, MTN_API_SECRET),
            headers={"Ocp-Apim-Subscription-Key": MTN_API_KEY},
        )
        token_response.raise_for_status()
        access = token_response.json()["access_token"]
        response = await client.get(
            f"/collection/v1_0/requesttopay/{reference}",
            headers={
                "Authorization": f"Bearer {access}",
                "X-Target-Environment": MTN_TARGET_ENV,
                "Ocp-Apim-Subscription-Key": MTN_API_KEY,
            },
        )
        response.raise_for_status()
        status = str(response.json().get("status", "")).upper()
        return "success" if status == "SUCCESSFUL" else "failed" if status == "FAILED" else "pending"


async def check_status_orange(reference: str) -> str | None:
    return None


async def sweep_stuck_mobile_payments(pending_after_min: int = 15, expire_after_min: int = 120) -> dict:
    factory = async_sessionmaker(get_central_engine(), expire_on_commit=False)
    async with factory() as central:
        rows = (await central.execute(text("""
            SELECT reference, method, EXTRACT(EPOCH FROM (NOW() - created_at)) / 60 AS age_min
            FROM payment_intents
            WHERE status = 'processing'
              AND created_at < NOW() - make_interval(mins => CAST(:mins AS INT))
        """), {"mins": pending_after_min})).mappings().all()

    checked = confirmed = failed = expired = 0
    for row in rows:
        reference, method, age = row["reference"], row["method"], float(row["age_min"])
        status = None
        try:
            if method == "mtn_momo":
                status = await check_status_mtn(reference)
            elif method == "orange_money":
                status = await check_status_orange(reference)
        except Exception as exc:  # pragma: no cover - robustesse cron
            logger.warning("Statut %s indisponible pour %s: %s", method, reference, exc)
        checked += 1
        # Un intent isolé ne doit jamais faire échouer tout le balayage (cron) :
        # schéma disparu, donnée corrompue, indisponibilité transitoire… on
        # journalise et on poursuit avec les intents suivants.
        try:
            if status == "success":
                await reconcile_mobile_payment(reference, True)
                confirmed += 1
            elif status == "failed":
                await reconcile_mobile_payment(reference, False)
                failed += 1
            elif age >= expire_after_min:
                await reconcile_mobile_payment(reference, False, provider_ref="timeout")
                expired += 1
        except Exception as exc:  # pragma: no cover - robustesse cron
            logger.warning("Réconciliation impossible pour %s: %s", reference, exc)
    logger.info(
        "Balayage paiements bloqués: %d vus, %d confirmés, %d échoués, %d expirés",
        checked,
        confirmed,
        failed,
        expired,
    )
    return {"checked": checked, "confirmed": confirmed, "failed": failed, "expired": expired}


async def initiate_payment(
    ctx: dict,
    req: PaymentCreate,
    current_user: dict,
    central: AsyncSession,
    idempotency_key: str | None,
):
    method = normalize_method(req.method or req.payment_method)
    status_value = "processing" if method in {"orange_money", "mtn_momo"} else "pending"
    reference = req.payment_reference or f"TOS-{uuid.uuid4().hex[:10].upper()}"
    db = await get_tenant_db(ctx["schema_name"])
    try:
        cached = await idempotency_lookup(db, idempotency_key, "initiate_payment")
        if cached:
            return cached
        payment_id = await repository.create_payment(
            db,
            ctx,
            req,
            reference,
            method,
            status_value,
            int(current_user["sub"]),
        )
        result = {
            "id": payment_id,
            "reference": reference,
            "ref": reference,
            "status": status_value,
            "amount": req.amount,
            "method": method,
            "desc": req.description,
        }
        await idempotency_store(db, idempotency_key, "initiate_payment", result)
        await db.commit()
    finally:
        await db.close()

    if method in {"orange_money", "mtn_momo"}:
        await central.execute(text("""
            INSERT INTO payment_intents (reference, schema_name, payment_id, organization_id,
                                         tontine_id, member_id, amount, method, phone, status)
            VALUES (:ref, :schema, :pid, :org, :tid, :mid, :amount, :method, :phone, 'processing')
            ON CONFLICT (reference) DO NOTHING
        """), {
            "ref": reference,
            "schema": ctx["schema_name"],
            "pid": payment_id,
            "org": ctx["organization_id"],
            "tid": ctx["tontine_id"],
            "mid": req.member_id,
            "amount": req.amount,
            "method": method,
            "phone": req.phone,
        })
        await central.commit()
        from app.integrations.mobile_money.providers import (
            request_to_pay_mtn,
            request_to_pay_orange,
        )

        provider = request_to_pay_orange if method == "orange_money" else request_to_pay_mtn
        try:
            await provider(reference, float(req.amount), req.phone)
        except Exception as exc:
            logger.warning("Initiation %s échouée pour %s: %s", method, reference, exc)

    await audit(current_user, "INITIATE_PAYMENT", "payment", payment_id, {
        "amount": req.amount,
        "method": method,
    })
    return result


async def validate_payment(ctx: dict, payment_id: int, current_user: dict):
    db = await get_tenant_db(ctx["schema_name"])
    try:
        payment = await repository.get_payment(db, payment_id)
        if not payment:
            raise HTTPException(404, "Paiement introuvable")
        if payment["status"] == "success":
            return {"payment_id": payment_id, "status": "success"}
        await settle_payment_success(
            db,
            payment,
            ctx["organization_id"],
            ctx["tontine_id"],
            int(current_user["sub"]),
        )
        await db.commit()
    finally:
        await db.close()
    await audit(current_user, "VALIDATE_PAYMENT", "payment", payment_id)
    return {"payment_id": payment_id, "status": "success"}


async def cancel_payment(ctx: dict, payment_id: int, req: PaymentCancel, current_user: dict):
    db = await get_tenant_db(ctx["schema_name"])
    try:
        row = await repository.cancel_pending_payment(db, payment_id, req.reason)
        if not row:
            raise HTTPException(404, "Paiement introuvable ou déjà confirmé")
        await db.commit()
    finally:
        await db.close()
    await audit(current_user, "CANCEL_PAYMENT", "payment", payment_id, {"reason": req.reason})
    return {"payment_id": payment_id, "status": "cancelled"}


async def reverse_payment(ctx: dict, payment_id: int, req: PaymentCancel, current_user: dict):
    db = await get_tenant_db(ctx["schema_name"])
    try:
        payment = await repository.get_payment(db, payment_id)
        if not payment:
            raise HTTPException(404, "Paiement introuvable")
        if payment["status"] != "success":
            raise HTTPException(409, "Seul un paiement confirmé peut être annulé")
        if payment["reversed_at"]:
            raise HTTPException(409, "Paiement déjà annulé")
        await lock_cash_balance(db)
        await repository.mark_payment_reversed(db, payment_id, req.reason)
        if payment["contribution_id"]:
            await repository.reverse_member_cotisation(
                db,
                int(payment["contribution_id"]),
                int(payment["member_id"]),
                float(payment["amount"]),
            )
        await add_cash_movement(
            db,
            ctx["organization_id"],
            ctx["tontine_id"],
            "expense",
            "reversal",
            float(payment["amount"]),
            f"Annulation paiement {payment['reference']} — {req.reason}",
            "payment",
            payment_id,
            int(current_user["sub"]),
        )
        await create_receipt(
            db,
            ctx["organization_id"],
            ctx["tontine_id"],
            int(payment["member_id"]),
            payment_id,
            "reversal",
            float(payment["amount"]),
            payment["method"],
            payment["reference"],
            int(current_user["sub"]),
        )
        await create_notification(
            db,
            int(payment["member_id"]),
            "Paiement annulé",
            f"Le paiement {payment['reference']} a été annulé.",
            "payment_reversed",
            "/member/payments",
        )
        await db.commit()
    finally:
        await db.close()
    await audit(current_user, "REVERSE_PAYMENT", "payment", payment_id, {
        "reason": req.reason,
        "amount": float(payment["amount"]),
    })
    return {"payment_id": payment_id, "status": "reversed"}

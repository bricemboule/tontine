import logging

from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse

from app.integrations.mobile_money.security import verifier_hmac
from app.modules.payments.service import reconcile_mobile_payment
from app.core.config import ENVIRONMENT, MTN_WEBHOOK_SECRET, ORANGE_WEBHOOK_SECRET

logger = logging.getLogger(__name__)


def _verifier_secret_configure(nom: str, secret: str) -> None:
    if not secret and ENVIRONMENT != "development":
        raise HTTPException(503, f"Webhook {nom} non configuré (secret manquant)")


def _verifier_signature(nom: str, secret: str, body: bytes, signature: str) -> None:
    _verifier_secret_configure(nom, secret)
    if secret and not verifier_hmac(secret, body, signature):
        raise HTTPException(401, "Signature invalide")


async def traiter_webhook_orange(request: Request):
    body = await request.body()
    _verifier_signature(
        "Orange",
        ORANGE_WEBHOOK_SECRET,
        body,
        request.headers.get("X-Orange-Signature", ""),
    )

    payload = await request.json()
    reference = payload.get("order_id") or payload.get("reference")
    statut = str(payload.get("status", "")).upper()
    paiement_reussi = statut in {"SUCCESS", "SUCCESSFUL", "COMPLETED", "PAID"}
    logger.info("Webhook Orange: %s - %s", statut, reference)
    if reference:
        await reconcile_mobile_payment(reference, paiement_reussi, provider_ref=payload.get("txnid"))
    return JSONResponse({"received": True})


async def traiter_webhook_mtn(request: Request):
    body = await request.body()
    _verifier_signature(
        "MTN",
        MTN_WEBHOOK_SECRET,
        body,
        request.headers.get("X-MTN-Signature", ""),
    )

    payload = await request.json()
    reference = payload.get("referenceId") or payload.get("externalId")
    statut = str(payload.get("status", "")).upper()
    paiement_reussi = statut == "SUCCESSFUL"
    logger.info("Webhook MTN: %s - %s", statut, reference)
    if reference:
        await reconcile_mobile_payment(
            reference,
            paiement_reussi,
            provider_ref=payload.get("financialTransactionId"),
        )
    return JSONResponse({"received": True})

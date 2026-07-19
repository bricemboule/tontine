import logging
from typing import Optional

import httpx

from app.core.config import (
    API_BASE_URL,
    MTN_API_KEY,
    MTN_API_SECRET,
    MTN_API_USER,
    MTN_COLLECTION_URL,
    MTN_TARGET_ENV,
    ORANGE_CLIENT_ID,
    ORANGE_CLIENT_SECRET,
    ORANGE_MERCHANT_KEY,
    ORANGE_TOKEN_URL,
    ORANGE_WEBPAY_URL,
)

logger = logging.getLogger(__name__)


async def request_to_pay_orange(reference: str, amount: float, phone: Optional[str]) -> None:
    if not (ORANGE_CLIENT_ID and ORANGE_CLIENT_SECRET and ORANGE_MERCHANT_KEY):
        logger.info("Orange Money non configuré - paiement %s laissé en 'processing'", reference)
        return
    async with httpx.AsyncClient(timeout=15.0) as client:
        token_response = await client.post(
            ORANGE_TOKEN_URL,
            data={"grant_type": "client_credentials"},
            auth=(ORANGE_CLIENT_ID, ORANGE_CLIENT_SECRET),
            headers={"Accept": "application/json"},
        )
        token_response.raise_for_status()
        access = token_response.json()["access_token"]
        response = await client.post(
            ORANGE_WEBPAY_URL,
            headers={"Authorization": f"Bearer {access}", "Content-Type": "application/json"},
            json={
                "merchant_key": ORANGE_MERCHANT_KEY,
                "currency": "XAF",
                "order_id": reference,
                "amount": int(amount),
                "return_url": f"{API_BASE_URL}/payments/return",
                "cancel_url": f"{API_BASE_URL}/payments/cancel",
                "notif_url": f"{API_BASE_URL}/webhooks/orange",
                "lang": "fr",
                "reference": reference,
            },
        )
        response.raise_for_status()
        logger.info("Orange WebPay initié pour %s", reference)


async def request_to_pay_mtn(reference: str, amount: float, phone: Optional[str]) -> None:
    if not (MTN_API_KEY and MTN_API_USER and MTN_API_SECRET):
        logger.info("MTN MoMo non configuré - paiement %s laissé en 'processing'", reference)
        return
    async with httpx.AsyncClient(timeout=15.0, base_url=MTN_COLLECTION_URL) as client:
        token_response = await client.post(
            "/collection/token/",
            auth=(MTN_API_USER, MTN_API_SECRET),
            headers={"Ocp-Apim-Subscription-Key": MTN_API_KEY},
        )
        token_response.raise_for_status()
        access = token_response.json()["access_token"]
        response = await client.post(
            "/collection/v1_0/requesttopay",
            headers={
                "Authorization": f"Bearer {access}",
                "X-Reference-Id": reference,
                "X-Target-Environment": MTN_TARGET_ENV,
                "Ocp-Apim-Subscription-Key": MTN_API_KEY,
                "Content-Type": "application/json",
            },
            json={
                "amount": str(int(amount)),
                "currency": "XAF" if MTN_TARGET_ENV != "sandbox" else "EUR",
                "externalId": reference,
                "payer": {"partyIdType": "MSISDN", "partyId": (phone or "").lstrip("+")},
                "payerMessage": "Cotisation tontine",
                "payeeNote": reference,
            },
        )
        response.raise_for_status()
        logger.info("MTN Request-to-Pay initié pour %s", reference)

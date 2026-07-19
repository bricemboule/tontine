from fastapi import APIRouter, Request

from app.integrations.mobile_money import service

router = APIRouter(prefix="/webhooks", tags=["Webhooks Mobile Money"])


@router.post("/orange")
async def orange_webhook(request: Request):
    return await service.traiter_webhook_orange(request)


@router.post("/mtn")
async def mtn_webhook(request: Request):
    return await service.traiter_webhook_mtn(request)

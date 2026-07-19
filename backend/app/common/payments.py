from typing import Optional

from fastapi import HTTPException

from app.core.models import PaymentMethod


def normalize_method(method: Optional[str]) -> str:
    if not method:
        return PaymentMethod.ESPECES.value
    value = method.strip().lower()
    aliases = {
        "cash": PaymentMethod.ESPECES.value,
        "espece": PaymentMethod.ESPECES.value,
        "espèces": PaymentMethod.ESPECES.value,
        "orange": PaymentMethod.ORANGE_MONEY.value,
        "om": PaymentMethod.ORANGE_MONEY.value,
        "mtn": PaymentMethod.MTN_MOMO.value,
        "momo": PaymentMethod.MTN_MOMO.value,
        "bank": PaymentMethod.VIREMENT.value,
    }
    value = aliases.get(value, value)
    allowed = {item.value for item in PaymentMethod}
    if value not in allowed:
        raise HTTPException(400, f"Méthode de paiement invalide: {method}")
    return value


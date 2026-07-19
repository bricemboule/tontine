from typing import Optional

from pydantic import BaseModel


class PaymentCreate(BaseModel):
    member_id: int
    amount: float
    method: Optional[str] = None
    payment_method: Optional[str] = None
    phone: Optional[str] = None
    description: str = "Paiement"
    contribution_id: Optional[int] = None
    payment_reference: Optional[str] = None


class PaymentCancel(BaseModel):
    reason: str = "Annulation demandée"


class AnnulationPaiementLegacy(BaseModel):
    reason: str = "Annulation manuelle"


PaymentCreateMVP = PaymentCreate
PaymentCancelMVP = AnnulationPaiementLegacy

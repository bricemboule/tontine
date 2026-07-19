from datetime import date
from typing import Optional

from pydantic import BaseModel


class CotisationCreate(BaseModel):
    label: str
    amount: float
    date_debut: date
    date_fin: date
    cycle_id: Optional[int] = None


class CotisationPay(BaseModel):
    member_id: int
    amount: float
    payment_method: str = "especes"
    payment_reference: Optional[str] = None


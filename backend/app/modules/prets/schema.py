from typing import Optional

from pydantic import BaseModel


class CreationPret(BaseModel):
    member_id: int
    amount: Optional[float] = None
    requested_amount: Optional[float] = None
    interest_rate: float = 5
    months: Optional[int] = None
    duration_months: Optional[int] = None
    purpose: Optional[str] = None


class RemboursementPret(BaseModel):
    amount: float
    payment_method: str = "especes"


LoanCreateMVP = CreationPret
LoanRepayMVP = RemboursementPret

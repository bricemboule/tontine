from typing import Optional

from pydantic import BaseModel


class ModificationParametres(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    frequency: Optional[str] = None
    cotisation_amount: Optional[float] = None
    max_members: Optional[int] = None
    loan_interest_rate: Optional[float] = None
    penalty_rate: Optional[float] = None
    grace_days: Optional[int] = None


ConfigUpdateMVP = ModificationParametres

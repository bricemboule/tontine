from datetime import date
from typing import Optional

from pydantic import BaseModel


class CreationPenalite(BaseModel):
    member_id: int
    reason: str
    amount: float
    due_date: Optional[date] = None


class PaiementPenalite(BaseModel):
    amount: float
    payment_method: str = "especes"


class AnnulationPenalite(BaseModel):
    reason: str = "Annulation manuelle"


PenaltyCreateMVP = CreationPenalite
PenaltyPayMVP = PaiementPenalite

from typing import Optional

from pydantic import BaseModel


class CreationDecaissement(BaseModel):
    member_id: Optional[int] = None
    cycle_id: Optional[int] = None
    payout_turn_id: Optional[int] = None
    amount: float
    reason: str


class DecisionDecaissement(BaseModel):
    reason: Optional[str] = None


PayoutCreateMVP = CreationDecaissement
PayoutDecisionMVP = DecisionDecaissement

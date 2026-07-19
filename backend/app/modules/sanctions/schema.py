from datetime import date
from typing import Optional

from pydantic import BaseModel, field_validator


class CreationSanction(BaseModel):
    member_id: int
    type: str
    reason: str
    fine: float = 0
    start_date: date


class ValidationSanction(BaseModel):
    action: str
    rejection_reason: Optional[str] = None

    @field_validator("action")
    @classmethod
    def action_valide(cls, value: str) -> str:
        if value not in {"approve", "reject"}:
            raise ValueError("Action invalide")
        return value


SanctionCreateMVP = CreationSanction
SanctionValidateMVP = ValidationSanction

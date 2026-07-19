from datetime import date
from typing import Optional

from pydantic import BaseModel


class CreationCycle(BaseModel):
    name: str
    start_date: date
    end_date: Optional[date] = None
    expected_total_amount: float = 0


CycleCreateMVP = CreationCycle

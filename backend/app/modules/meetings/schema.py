from datetime import date as date_type
from typing import Optional

from pydantic import BaseModel


class MeetingCreate(BaseModel):
    title: str
    # NB : le champ nommé `date` masquerait le type importé `date` pour les
    # annotations suivantes (meeting_date deviendrait Optional[None]).
    # On importe donc le type sous l'alias date_type.
    date: Optional[date_type] = None
    meeting_date: Optional[date_type] = None
    time: str = "15:00"
    location: str
    agenda: Optional[str] = None
    beneficiary: Optional[str] = None


class MeetingClose(BaseModel):
    collected: float = 0
    attendees: int = 0
    report: Optional[str] = None
    absentees: list[int] = []
    absence_penalty: float = 0


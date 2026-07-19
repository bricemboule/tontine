import enum
from datetime import date, datetime
from decimal import Decimal


def clean_row(row) -> dict:
    data = dict(row)
    for key, value in list(data.items()):
        if isinstance(value, Decimal):
            data[key] = float(value)
        elif isinstance(value, (datetime, date)):
            data[key] = value.isoformat()
        elif isinstance(value, enum.Enum):
            data[key] = value.value
    return data


def clean_rows(rows) -> list[dict]:
    return [clean_row(row) for row in rows]


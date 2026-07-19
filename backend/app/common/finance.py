"""Calculs financiers purs du backend TontineOS."""
from datetime import date, timedelta
from decimal import Decimal, ROUND_HALF_UP


def calc_loan(principal: float, annual_rate: float, months: int) -> dict:
    """Flat rate (amortissement linéaire, standard Afrique)."""
    p = Decimal(str(principal))
    r = Decimal(str(annual_rate)) / 100 / 12
    m = months
    interest = (p * r * m).quantize(Decimal("1"), rounding=ROUND_HALF_UP)
    total = p + interest
    monthly = (total / m).quantize(Decimal("1"), rounding=ROUND_HALF_UP)
    last = total - monthly * (m - 1)
    return {
        "principal": float(p),
        "annual_rate": annual_rate,
        "total_interest": float(interest),
        "total_due": float(total),
        "monthly_payment": float(monthly),
        "last_payment": float(last),
    }


def calc_penalty(
    amount: float,
    due_date: date,
    paid_date: date,
    grace_days: int,
    monthly_rate_pct: float,
) -> float:
    grace_end = due_date + timedelta(days=grace_days)
    if paid_date <= grace_end:
        return 0.0
    days = (paid_date - grace_end).days
    daily = Decimal(str(monthly_rate_pct)) / 100 / 30
    return float((Decimal(str(amount)) * daily * days).quantize(Decimal("1"), rounding=ROUND_HALF_UP))

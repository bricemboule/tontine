"""Tests unitaires purs des calculs financiers — aucune base requise."""
from datetime import date

from main import calc_loan, calc_penalty


def test_calc_loan_flat_rate_repartition():
    r = calc_loan(150000, 5, 3)
    # Intérêt flat : principal * (taux/100/12) * mois
    assert r["total_interest"] == 1875
    assert r["total_due"] == 151875
    # La somme des mensualités doit égaler exactement le total dû
    assert r["monthly_payment"] * 2 + r["last_payment"] == r["total_due"]


def test_calc_loan_dernier_paiement_absorbe_arrondi():
    r = calc_loan(100000, 7, 7)
    total_reconstruit = r["monthly_payment"] * 6 + r["last_payment"]
    assert round(total_reconstruit, 2) == round(r["total_due"], 2)


def test_calc_penalty_zero_pendant_le_delai_de_grace():
    due = date(2026, 1, 10)
    assert calc_penalty(50000, due, date(2026, 1, 12), grace_days=3, monthly_rate_pct=5) == 0.0


def test_calc_penalty_apres_delai_de_grace():
    due = date(2026, 1, 10)
    # 5 jours au-delà de la fin de grâce (13 -> 18)
    penalty = calc_penalty(50000, due, date(2026, 1, 18), grace_days=3, monthly_rate_pct=5)
    assert penalty > 0

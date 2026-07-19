"""
TontineOS — Tâches planifiées Celery.

Tâches actives :
- sweep_late_penalties : applique quotidiennement les pénalités de retard de
  cotisation sur tous les schémas tenant.
- sweep_stuck_payments : réconcilie/expire les paiements mobile money bloqués.
"""
import asyncio

from celery import Celery
from celery.schedules import crontab

from app.core.config import CELERY_REDIS_URL

app = Celery("tontineos", broker=CELERY_REDIS_URL, backend=CELERY_REDIS_URL)
app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Africa/Douala",
    beat_schedule={
        "penalites-retard-quotidiennes": {
            "task": "tasks.sweep_late_penalties",
            "schedule": crontab(hour=6, minute=0),
        },
        "paiements-mobiles-bloques": {
            "task": "tasks.sweep_stuck_payments",
            "schedule": crontab(minute="*/15"),
        },
    },
)


@app.task(name="tasks.sweep_late_penalties")
def sweep_late_penalties():
    """Point d'entrée synchrone Celery -> logique async multi-tenant."""
    from app.modules.cotisations.service import sweep_late_penalties_all

    return asyncio.run(sweep_late_penalties_all())


@app.task(name="tasks.sweep_stuck_payments")
def sweep_stuck_payments():
    """Réconcilie/expire les paiements mobile money restés 'processing'."""
    from app.modules.payments.service import sweep_stuck_mobile_payments

    return asyncio.run(sweep_stuck_mobile_payments())

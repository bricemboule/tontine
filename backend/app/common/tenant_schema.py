import logging

from fastapi import HTTPException
from sqlalchemy import text

from app.core.database import TENANT_RE, get_central_engine

logger = logging.getLogger(__name__)


def quote_schema(schema: str) -> str:
    if not TENANT_RE.match(schema):
        raise HTTPException(400, "Nom de schéma invalide")
    return f'"{schema}"'


def tenant_sql(schema: str) -> list[str]:
    s = quote_schema(schema)
    return [
        f'CREATE SCHEMA IF NOT EXISTS {s}',
        f"""
        CREATE TABLE IF NOT EXISTS {s}.tontine_config (
            id BIGSERIAL PRIMARY KEY,
            name VARCHAR(200) NOT NULL,
            description TEXT,
            type VARCHAR(20) NOT NULL DEFAULT 'mixte',
            frequency VARCHAR(20) NOT NULL DEFAULT 'monthly',
            status VARCHAR(20) DEFAULT 'active',
            currency VARCHAR(5) DEFAULT 'XAF',
            cotisation_amount NUMERIC(15,2) NOT NULL DEFAULT 50000,
            max_members SMALLINT DEFAULT 20,
            min_members SMALLINT DEFAULT 3,
            start_date DATE,
            end_date DATE,
            loan_interest_rate NUMERIC(5,2) DEFAULT 5.00,
            penalty_rate NUMERIC(5,2) DEFAULT 5.00,
            grace_days SMALLINT DEFAULT 3,
            max_loan_multiplier NUMERIC(4,1) DEFAULT 3.0,
            allow_loans BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
        """,
        f"""
        CREATE TABLE IF NOT EXISTS {s}.members (
            id BIGSERIAL PRIMARY KEY,
            user_id BIGINT NOT NULL,
            status VARCHAR(20) DEFAULT 'pending',
            role VARCHAR(20) DEFAULT 'membre',
            tour_order SMALLINT,
            joined_at DATE,
            validated_by BIGINT,
            validated_at TIMESTAMPTZ,
            rejection_reason TEXT,
            notes TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
        """,
        f"""
        CREATE TABLE IF NOT EXISTS {s}.cotisations (
            id BIGSERIAL PRIMARY KEY,
            label VARCHAR(200) NOT NULL,
            amount NUMERIC(15,2) NOT NULL,
            due_date DATE NOT NULL,
            closing_date DATE,
            notes TEXT,
            status VARCHAR(20) DEFAULT 'open',
            created_by BIGINT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
        """,
        f"""
        CREATE TABLE IF NOT EXISTS {s}.loans (
            id BIGSERIAL PRIMARY KEY,
            member_id BIGINT NOT NULL,
            amount NUMERIC(15,2) NOT NULL,
            interest_rate NUMERIC(5,2) NOT NULL,
            duration_months SMALLINT NOT NULL,
            total_interest NUMERIC(15,2) NOT NULL,
            total_due NUMERIC(15,2) NOT NULL,
            monthly_payment NUMERIC(15,2) NOT NULL,
            amount_paid NUMERIC(15,2) DEFAULT 0,
            status VARCHAR(20) DEFAULT 'pending',
            start_date DATE,
            purpose TEXT,
            approved_by BIGINT,
            approved_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
        """,
        f"""
        CREATE TABLE IF NOT EXISTS {s}.payments (
            id BIGSERIAL PRIMARY KEY,
            reference VARCHAR(100) UNIQUE NOT NULL,
            member_id BIGINT NOT NULL,
            amount NUMERIC(15,2) NOT NULL,
            currency VARCHAR(5) DEFAULT 'XAF',
            method VARCHAR(20) NOT NULL,
            status VARCHAR(20) DEFAULT 'pending',
            phone_number VARCHAR(20),
            description TEXT,
            validated_by BIGINT,
            validated_at TIMESTAMPTZ,
            initiated_at TIMESTAMPTZ DEFAULT NOW(),
            completed_at TIMESTAMPTZ
        )
        """,
        f"""
        CREATE TABLE IF NOT EXISTS {s}.meetings (
            id BIGSERIAL PRIMARY KEY,
            title VARCHAR(300) NOT NULL,
            event_date DATE NOT NULL,
            event_time VARCHAR(5),
            location VARCHAR(300),
            description TEXT,
            status VARCHAR(20) DEFAULT 'upcoming',
            beneficiary_id BIGINT,
            total_collected NUMERIC(15,2) DEFAULT 0,
            attendees_count SMALLINT DEFAULT 0,
            created_by BIGINT,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
        """,
        f"""
        CREATE TABLE IF NOT EXISTS {s}.sanctions (
            id BIGSERIAL PRIMARY KEY,
            member_id BIGINT NOT NULL,
            type VARCHAR(30) NOT NULL,
            status VARCHAR(25) DEFAULT 'pending_president',
            reason TEXT NOT NULL,
            fine_amount NUMERIC(15,2) DEFAULT 0,
            start_date DATE NOT NULL,
            proposed_by BIGINT NOT NULL,
            validated_by BIGINT,
            validated_at TIMESTAMPTZ,
            lifted_by BIGINT,
            lifted_at TIMESTAMPTZ,
            lift_reason TEXT,
            rejection_reason TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
        """,
        f"""
        CREATE TABLE IF NOT EXISTS {s}.tour_assignments (
            id BIGSERIAL PRIMARY KEY,
            member_id BIGINT UNIQUE NOT NULL,
            order_position SMALLINT UNIQUE NOT NULL,
            scheduled_date DATE,
            actual_date DATE,
            amount_received NUMERIC(15,2) DEFAULT 0,
            status VARCHAR(20) DEFAULT 'pending',
            is_manual BOOLEAN DEFAULT FALSE,
            notes TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
        """,
        f"""
        CREATE TABLE IF NOT EXISTS {s}.notifications (
            id BIGSERIAL PRIMARY KEY,
            member_id BIGINT,
            channel VARCHAR(20) NOT NULL DEFAULT 'app',
            subject VARCHAR(300),
            body TEXT NOT NULL,
            status VARCHAR(20) DEFAULT 'pending',
            sent_at TIMESTAMPTZ,
            read_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
        """,
        f"ALTER TABLE {s}.members ADD COLUMN IF NOT EXISTS organization_id BIGINT",
        f"ALTER TABLE {s}.members ADD COLUMN IF NOT EXISTS tontine_id BIGINT",
        f"ALTER TABLE {s}.members ADD COLUMN IF NOT EXISTS photo VARCHAR(500)",
        f"ALTER TABLE {s}.members ADD COLUMN IF NOT EXISTS profession VARCHAR(160)",
        f"ALTER TABLE {s}.members ADD COLUMN IF NOT EXISTS address TEXT",
        f"ALTER TABLE {s}.members ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()",
        f"CREATE UNIQUE INDEX IF NOT EXISTS ux_{schema}_members_user_id ON {s}.members(user_id)",
        # Colonne ajoutée après coup : ALTER idempotent pour réparer les schémas
        # provisionnés par une version antérieure (CREATE TABLE IF NOT EXISTS
        # n'ajoute pas de colonne à une table déjà existante). La table loans est
        # créée plus haut dans cette liste, donc l'ALTER est valide ici.
        f"ALTER TABLE {s}.loans ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(15,2) DEFAULT 0",
        f"""
        CREATE TABLE IF NOT EXISTS {s}.cycles (
            id BIGSERIAL PRIMARY KEY,
            organization_id BIGINT NOT NULL,
            tontine_id BIGINT NOT NULL,
            name VARCHAR(200) NOT NULL,
            start_date DATE NOT NULL,
            end_date DATE,
            expected_total_amount NUMERIC(15,2) DEFAULT 0,
            status VARCHAR(20) DEFAULT 'draft',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
        """,
        f"CREATE UNIQUE INDEX IF NOT EXISTS ux_{schema}_cycles_name ON {s}.cycles(name)",
        f"ALTER TABLE {s}.cotisations ADD COLUMN IF NOT EXISTS organization_id BIGINT",
        f"ALTER TABLE {s}.cotisations ADD COLUMN IF NOT EXISTS tontine_id BIGINT",
        f"ALTER TABLE {s}.cotisations ADD COLUMN IF NOT EXISTS cycle_id BIGINT",
        f"ALTER TABLE {s}.cotisations ADD COLUMN IF NOT EXISTS closing_date DATE",
        f"ALTER TABLE {s}.cotisations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()",
        f"CREATE UNIQUE INDEX IF NOT EXISTS ux_{schema}_cotisations_label ON {s}.cotisations(label)",
        f"""
        CREATE TABLE IF NOT EXISTS {s}.member_cotisations (
            id BIGSERIAL PRIMARY KEY,
            organization_id BIGINT,
            tontine_id BIGINT,
            member_id BIGINT NOT NULL REFERENCES {s}.members(id),
            cotisation_id BIGINT NOT NULL REFERENCES {s}.cotisations(id),
            status VARCHAR(20) DEFAULT 'pending',
            amount_due NUMERIC(15,2) NOT NULL,
            amount_paid NUMERIC(15,2) DEFAULT 0,
            penalty_amount NUMERIC(15,2) DEFAULT 0,
            paid_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(member_id, cotisation_id)
        )
        """,
        # Colonnes ajoutées après coup : ALTER idempotents pour réparer les
        # schémas déjà provisionnés (placés APRÈS le CREATE de la table).
        f"ALTER TABLE {s}.member_cotisations ADD COLUMN IF NOT EXISTS organization_id BIGINT",
        f"ALTER TABLE {s}.member_cotisations ADD COLUMN IF NOT EXISTS tontine_id BIGINT",
        f"ALTER TABLE {s}.member_cotisations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()",
        f"""
        CREATE TABLE IF NOT EXISTS {s}.contributions (
            id BIGSERIAL PRIMARY KEY,
            organization_id BIGINT NOT NULL,
            tontine_id BIGINT NOT NULL,
            cycle_id BIGINT REFERENCES {s}.cycles(id),
            member_id BIGINT NOT NULL REFERENCES {s}.members(id),
            amount NUMERIC(15,2) NOT NULL,
            due_date DATE NOT NULL,
            paid_amount NUMERIC(15,2) DEFAULT 0,
            remaining_amount NUMERIC(15,2) DEFAULT 0,
            status VARCHAR(20) DEFAULT 'pending',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
        """,
        f"ALTER TABLE {s}.payments ADD COLUMN IF NOT EXISTS organization_id BIGINT",
        f"ALTER TABLE {s}.payments ADD COLUMN IF NOT EXISTS tontine_id BIGINT",
        f"ALTER TABLE {s}.payments ADD COLUMN IF NOT EXISTS contribution_id BIGINT",
        f"ALTER TABLE {s}.payments ADD COLUMN IF NOT EXISTS payment_date TIMESTAMPTZ DEFAULT NOW()",
        f"ALTER TABLE {s}.payments ADD COLUMN IF NOT EXISTS cancellation_reason TEXT",
        f"ALTER TABLE {s}.payments ADD COLUMN IF NOT EXISTS recorded_by BIGINT",
        f"ALTER TABLE {s}.payments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()",
        f"""
        CREATE TABLE IF NOT EXISTS {s}.cash_movements (
            id BIGSERIAL PRIMARY KEY,
            organization_id BIGINT NOT NULL,
            tontine_id BIGINT,
            type VARCHAR(20) NOT NULL,
            category VARCHAR(40) NOT NULL,
            amount NUMERIC(15,2) NOT NULL,
            description TEXT,
            reference_type VARCHAR(60),
            reference_id BIGINT,
            created_by BIGINT,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
        """,
        f"""
        CREATE TABLE IF NOT EXISTS {s}.penalties (
            id BIGSERIAL PRIMARY KEY,
            organization_id BIGINT NOT NULL,
            tontine_id BIGINT NOT NULL,
            member_id BIGINT NOT NULL REFERENCES {s}.members(id),
            reason TEXT NOT NULL,
            amount NUMERIC(15,2) NOT NULL,
            paid_amount NUMERIC(15,2) DEFAULT 0,
            status VARCHAR(20) DEFAULT 'unpaid',
            due_date DATE,
            cancellation_reason TEXT,
            created_by BIGINT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
        """,
        f"ALTER TABLE {s}.loans ADD COLUMN IF NOT EXISTS organization_id BIGINT",
        f"ALTER TABLE {s}.loans ADD COLUMN IF NOT EXISTS tontine_id BIGINT",
        f"ALTER TABLE {s}.loans ADD COLUMN IF NOT EXISTS remaining_amount NUMERIC(15,2) DEFAULT 0",
        f"ALTER TABLE {s}.loans ADD COLUMN IF NOT EXISTS requested_at TIMESTAMPTZ DEFAULT NOW()",
        f"ALTER TABLE {s}.loans ADD COLUMN IF NOT EXISTS disbursed_at TIMESTAMPTZ",
        f"ALTER TABLE {s}.loans ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()",
        f"""
        CREATE TABLE IF NOT EXISTS {s}.loan_repayments (
            id BIGSERIAL PRIMARY KEY,
            organization_id BIGINT NOT NULL,
            loan_id BIGINT NOT NULL REFERENCES {s}.loans(id),
            member_id BIGINT NOT NULL REFERENCES {s}.members(id),
            amount NUMERIC(15,2) NOT NULL,
            payment_date TIMESTAMPTZ DEFAULT NOW(),
            payment_method VARCHAR(40),
            recorded_by BIGINT,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
        """,
        f"""
        CREATE TABLE IF NOT EXISTS {s}.payout_turns (
            id BIGSERIAL PRIMARY KEY,
            organization_id BIGINT NOT NULL,
            tontine_id BIGINT NOT NULL,
            cycle_id BIGINT REFERENCES {s}.cycles(id),
            member_id BIGINT NOT NULL REFERENCES {s}.members(id),
            position INT NOT NULL,
            scheduled_date DATE,
            amount_to_receive NUMERIC(15,2) DEFAULT 0,
            status VARCHAR(20) DEFAULT 'waiting',
            paid_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
        """,
        f"CREATE UNIQUE INDEX IF NOT EXISTS ux_{schema}_payout_turn_cycle_member ON {s}.payout_turns(cycle_id, member_id)",
        f"""
        CREATE TABLE IF NOT EXISTS {s}.payouts (
            id BIGSERIAL PRIMARY KEY,
            organization_id BIGINT NOT NULL,
            tontine_id BIGINT NOT NULL,
            cycle_id BIGINT REFERENCES {s}.cycles(id),
            member_id BIGINT REFERENCES {s}.members(id),
            amount NUMERIC(15,2) NOT NULL,
            reason TEXT NOT NULL,
            payout_turn_id BIGINT REFERENCES {s}.payout_turns(id),
            requested_by BIGINT,
            approved_by BIGINT,
            status VARCHAR(20) DEFAULT 'pending',
            paid_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
        """,
        f"ALTER TABLE {s}.meetings ADD COLUMN IF NOT EXISTS organization_id BIGINT",
        f"ALTER TABLE {s}.meetings ADD COLUMN IF NOT EXISTS tontine_id BIGINT",
        f"ALTER TABLE {s}.meetings ADD COLUMN IF NOT EXISTS agenda TEXT",
        f"ALTER TABLE {s}.meetings ADD COLUMN IF NOT EXISTS report TEXT",
        f"ALTER TABLE {s}.meetings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()",
        f"""
        CREATE TABLE IF NOT EXISTS {s}.meeting_attendances (
            id BIGSERIAL PRIMARY KEY,
            meeting_id BIGINT NOT NULL REFERENCES {s}.meetings(id),
            member_id BIGINT NOT NULL REFERENCES {s}.members(id),
            status VARCHAR(20) DEFAULT 'present',
            penalty_amount NUMERIC(15,2),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(meeting_id, member_id)
        )
        """,
        f"ALTER TABLE {s}.sanctions ADD COLUMN IF NOT EXISTS organization_id BIGINT",
        f"ALTER TABLE {s}.sanctions ADD COLUMN IF NOT EXISTS tontine_id BIGINT",
        f"ALTER TABLE {s}.sanctions ADD COLUMN IF NOT EXISTS rejection_reason TEXT",
        f"ALTER TABLE {s}.notifications ADD COLUMN IF NOT EXISTS organization_id BIGINT",
        f"ALTER TABLE {s}.notifications ADD COLUMN IF NOT EXISTS user_id BIGINT",
        f"ALTER TABLE {s}.notifications ADD COLUMN IF NOT EXISTS type VARCHAR(40)",
        f"ALTER TABLE {s}.notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE",
        f"ALTER TABLE {s}.notifications ADD COLUMN IF NOT EXISTS link VARCHAR(500)",
        f"""
        CREATE TABLE IF NOT EXISTS {s}.receipts (
            id BIGSERIAL PRIMARY KEY,
            organization_id BIGINT NOT NULL,
            tontine_id BIGINT NOT NULL,
            member_id BIGINT NOT NULL REFERENCES {s}.members(id),
            payment_id BIGINT,
            number VARCHAR(80) UNIQUE NOT NULL,
            type VARCHAR(40) NOT NULL,
            amount NUMERIC(15,2) NOT NULL,
            payment_method VARCHAR(40),
            payment_reference VARCHAR(120),
            recorded_by BIGINT,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
        """,
        # ── Vague 1 : solde de caisse faisant autorité (verrou + garantie DB) ──
        f"""
        CREATE TABLE IF NOT EXISTS {s}.cash_account (
            id         SMALLINT PRIMARY KEY DEFAULT 1,
            balance    NUMERIC(15,2) NOT NULL DEFAULT 0,
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            CONSTRAINT ck_{schema}_cash_single_row   CHECK (id = 1),
            CONSTRAINT ck_{schema}_cash_non_negative  CHECK (balance >= 0)
        )
        """,
        f"INSERT INTO {s}.cash_account (id, balance) VALUES (1, 0) ON CONFLICT DO NOTHING",
        # Backfill / réconciliation idempotente depuis les mouvements existants
        f"""
        UPDATE {s}.cash_account SET balance = (
            SELECT COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0)
            FROM {s}.cash_movements
        ) WHERE id = 1
        """,
        # ── Vague 1 : idempotence des écritures ──
        f"""
        CREATE TABLE IF NOT EXISTS {s}.request_idempotency (
            key        VARCHAR(80) PRIMARY KEY,
            scope      VARCHAR(40) NOT NULL,
            response   JSONB NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
        """,
        # ── Vague 1 : réversibilité d'un paiement validé ──
        f"ALTER TABLE {s}.payments ADD COLUMN IF NOT EXISTS reversed_at TIMESTAMPTZ",
        f"ALTER TABLE {s}.payments ADD COLUMN IF NOT EXISTS reversal_of BIGINT",
        # ── Vague 2 : pénalités de retard idempotentes (une par cotisation membre) ──
        f"ALTER TABLE {s}.penalties ADD COLUMN IF NOT EXISTS reference_type VARCHAR(40)",
        f"ALTER TABLE {s}.penalties ADD COLUMN IF NOT EXISTS reference_id BIGINT",
        f"""CREATE UNIQUE INDEX IF NOT EXISTS ux_{schema}_penalty_ref
            ON {s}.penalties(reference_type, reference_id)
            WHERE reference_type IS NOT NULL""",
        # ── Index de performance (filtres/joins fréquents sur member_id + status) ──
        f"CREATE INDEX IF NOT EXISTS ix_{schema}_members_status ON {s}.members(status)",
        f"CREATE INDEX IF NOT EXISTS ix_{schema}_mc_member ON {s}.member_cotisations(member_id)",
        f"CREATE INDEX IF NOT EXISTS ix_{schema}_mc_status ON {s}.member_cotisations(status)",
        f"CREATE INDEX IF NOT EXISTS ix_{schema}_payments_member ON {s}.payments(member_id)",
        f"CREATE INDEX IF NOT EXISTS ix_{schema}_payments_status ON {s}.payments(status)",
        f"CREATE INDEX IF NOT EXISTS ix_{schema}_loans_member ON {s}.loans(member_id)",
        f"CREATE INDEX IF NOT EXISTS ix_{schema}_loans_status ON {s}.loans(status)",
        f"CREATE INDEX IF NOT EXISTS ix_{schema}_penalties_member ON {s}.penalties(member_id)",
        f"CREATE INDEX IF NOT EXISTS ix_{schema}_penalties_status ON {s}.penalties(status)",
        f"CREATE INDEX IF NOT EXISTS ix_{schema}_cash_created ON {s}.cash_movements(created_at DESC)",
        f"CREATE INDEX IF NOT EXISTS ix_{schema}_cash_ref ON {s}.cash_movements(reference_type, reference_id)",
        f"CREATE INDEX IF NOT EXISTS ix_{schema}_notif_member ON {s}.notifications(member_id)",
        f"CREATE INDEX IF NOT EXISTS ix_{schema}_receipts_member ON {s}.receipts(member_id)",
    ]


async def ensure_tenant_schema(schema: str) -> None:
    if not TENANT_RE.match(schema):
        logger.warning("Schéma ignoré: %s", schema)
        return
    engine = get_central_engine()
    async with engine.begin() as conn:
        for sql in tenant_sql(schema):
            await conn.execute(text(sql))

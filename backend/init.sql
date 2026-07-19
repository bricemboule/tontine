-- TontineOS — Initialisation de la base de données centrale
-- Exécuté automatiquement au premier démarrage de PostgreSQL

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Schéma public (registre central) ───────────────────────────

CREATE TABLE IF NOT EXISTS users (
    id               BIGSERIAL PRIMARY KEY,
    uuid             VARCHAR(36) UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
    email            VARCHAR(255) UNIQUE NOT NULL,
    phone            VARCHAR(20) UNIQUE NOT NULL,
    hashed_password  VARCHAR(255) NOT NULL,
    first_name       VARCHAR(100) NOT NULL,
    last_name        VARCHAR(100) NOT NULL,
    global_role      VARCHAR(20) NOT NULL DEFAULT 'membre',
    is_active        BOOLEAN DEFAULT TRUE,
    is_verified      BOOLEAN DEFAULT FALSE,
    notification_prefs JSONB DEFAULT '{"sms":true,"email":true,"whatsapp":false}',
    last_login       TIMESTAMPTZ,
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tontine_registry (
    id          BIGSERIAL PRIMARY KEY,
    uuid        VARCHAR(36) UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
    name        VARCHAR(200) NOT NULL,
    slug        VARCHAR(100) UNIQUE NOT NULL,
    schema_name VARCHAR(100) UNIQUE NOT NULL,
    type        VARCHAR(20) NOT NULL DEFAULT 'mixte',
    status      VARCHAR(20) NOT NULL DEFAULT 'draft',
    currency    VARCHAR(5) DEFAULT 'XAF',
    created_by  BIGINT REFERENCES users(id),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tontine_admin_assignments (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT UNIQUE REFERENCES users(id),    -- 1 admin = 1 tontine
    tontine_id  BIGINT UNIQUE REFERENCES tontine_registry(id),  -- 1 tontine = 1 admin
    assigned_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tontine_members (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT NOT NULL REFERENCES users(id),
    tontine_id BIGINT NOT NULL REFERENCES tontine_registry(id),
    role       VARCHAR(20) NOT NULL DEFAULT 'membre',
    status     VARCHAR(20) DEFAULT 'pending',
    joined_at  TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_member_per_tontine UNIQUE (user_id, tontine_id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT REFERENCES users(id),
    tontine_slug VARCHAR(100),
    action       VARCHAR(100) NOT NULL,
    resource     VARCHAR(100) NOT NULL,
    resource_id  VARCHAR(100),
    details      JSONB,
    ip_address   VARCHAR(45),
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS ix_audit_logs_tontine ON audit_logs(tontine_slug);

-- ── Refresh tokens révocables (rotation + détection de réutilisation) ──
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id         BIGSERIAL PRIMARY KEY,
    jti        VARCHAR(36) UNIQUE NOT NULL,
    user_id    BIGINT NOT NULL REFERENCES users(id),
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_refresh_tokens_user ON refresh_tokens(user_id);

-- ── Mobile money : locateur central (référence -> schéma) pour la réconciliation webhook ──
CREATE TABLE IF NOT EXISTS payment_intents (
    reference       VARCHAR(100) PRIMARY KEY,
    schema_name     VARCHAR(100) NOT NULL,
    payment_id      BIGINT,
    organization_id BIGINT,
    tontine_id      BIGINT,
    member_id       BIGINT,
    amount          NUMERIC(15,2) NOT NULL,
    method          VARCHAR(20) NOT NULL,
    phone           VARCHAR(20),
    status          VARCHAR(20) DEFAULT 'processing',
    provider_ref    VARCHAR(120),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    completed_at    TIMESTAMPTZ
);

-- ── Schéma template pour une tontine ────────────────────────────
-- Ce script est utilisé par provision_schema() pour créer le schéma
-- de chaque nouvelle tontine. En production, Alembic gère les migrations.

CREATE OR REPLACE FUNCTION provision_tontine_schema(schema_name TEXT)
RETURNS void AS $$
BEGIN
    -- Valider le nom du schéma
    IF schema_name !~ '^tontine_[a-z0-9_]+$' THEN
        RAISE EXCEPTION 'Nom de schéma invalide : %', schema_name;
    END IF;

    EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', schema_name);

    -- Config de la tontine
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.tontine_config (
            id                  BIGSERIAL PRIMARY KEY,
            name                VARCHAR(200) NOT NULL,
            description         TEXT,
            type                VARCHAR(20) NOT NULL DEFAULT ''mixte'',
            frequency           VARCHAR(20) NOT NULL DEFAULT ''mensuel'',
            status              VARCHAR(20) DEFAULT ''active'',
            currency            VARCHAR(5) DEFAULT ''XAF'',
            cotisation_amount   NUMERIC(15,2) NOT NULL DEFAULT 50000,
            max_members         SMALLINT DEFAULT 20,
            min_members         SMALLINT DEFAULT 3,
            start_date          DATE,
            end_date            DATE,
            loan_interest_rate  NUMERIC(5,2) DEFAULT 5.00,
            penalty_rate        NUMERIC(5,2) DEFAULT 5.00,
            grace_days          SMALLINT DEFAULT 3,
            max_loan_multiplier NUMERIC(4,1) DEFAULT 3.0,
            allow_loans         BOOLEAN DEFAULT TRUE,
            created_at          TIMESTAMPTZ DEFAULT NOW(),
            updated_at          TIMESTAMPTZ DEFAULT NOW()
        )', schema_name);

    -- Membres
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.members (
            id              BIGSERIAL PRIMARY KEY,
            user_id         BIGINT NOT NULL,
            status          VARCHAR(20) DEFAULT ''pending'',
            role            VARCHAR(20) DEFAULT ''membre'',
            tour_order      SMALLINT,
            joined_at       DATE,
            validated_by    BIGINT,
            validated_at    TIMESTAMPTZ,
            rejection_reason TEXT,
            notes           TEXT,
            created_at      TIMESTAMPTZ DEFAULT NOW(),
            updated_at      TIMESTAMPTZ DEFAULT NOW()
        )', schema_name);

    -- Cotisations
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.cotisations (
            id          BIGSERIAL PRIMARY KEY,
            label       VARCHAR(200) NOT NULL,
            amount      NUMERIC(15,2) NOT NULL,
            due_date    DATE NOT NULL,
            closing_date DATE,
            notes       TEXT,
            status      VARCHAR(20) DEFAULT ''open'',
            created_by  BIGINT,
            created_at  TIMESTAMPTZ DEFAULT NOW()
        )', schema_name);

    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.member_cotisations (
            id              BIGSERIAL PRIMARY KEY,
            member_id       BIGINT NOT NULL REFERENCES %I.members(id),
            cotisation_id   BIGINT NOT NULL REFERENCES %I.cotisations(id),
            status          VARCHAR(20) DEFAULT ''pending'',
            amount_due      NUMERIC(15,2) NOT NULL,
            amount_paid     NUMERIC(15,2) DEFAULT 0,
            penalty_amount  NUMERIC(15,2) DEFAULT 0,
            paid_at         TIMESTAMPTZ,
            created_at      TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(member_id, cotisation_id)
        )', schema_name, schema_name, schema_name);

    -- Prêts
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.loans (
            id              BIGSERIAL PRIMARY KEY,
            member_id       BIGINT NOT NULL REFERENCES %I.members(id),
            amount          NUMERIC(15,2) NOT NULL,
            interest_rate   NUMERIC(5,2) NOT NULL,
            duration_months SMALLINT NOT NULL,
            total_interest  NUMERIC(15,2) NOT NULL,
            total_due       NUMERIC(15,2) NOT NULL,
            monthly_payment NUMERIC(15,2) NOT NULL,
            status          VARCHAR(20) DEFAULT ''pending'',
            start_date      DATE,
            end_date        DATE,
            purpose         TEXT,
            approved_by     BIGINT,
            approved_at     TIMESTAMPTZ,
            created_at      TIMESTAMPTZ DEFAULT NOW()
        )', schema_name, schema_name);

    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.loan_schedules (
            id              BIGSERIAL PRIMARY KEY,
            loan_id         BIGINT NOT NULL REFERENCES %I.loans(id),
            installment_no  SMALLINT NOT NULL,
            due_date        DATE NOT NULL,
            principal       NUMERIC(15,2) NOT NULL,
            interest        NUMERIC(15,2) NOT NULL,
            total_payment   NUMERIC(15,2) NOT NULL,
            amount_paid     NUMERIC(15,2) DEFAULT 0,
            penalty         NUMERIC(15,2) DEFAULT 0,
            status          VARCHAR(20) DEFAULT ''pending'',
            paid_at         TIMESTAMPTZ
        )', schema_name, schema_name);

    -- Paiements
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.payments (
            id              BIGSERIAL PRIMARY KEY,
            reference       VARCHAR(100) UNIQUE NOT NULL,
            member_id       BIGINT NOT NULL REFERENCES %I.members(id),
            amount          NUMERIC(15,2) NOT NULL,
            currency        VARCHAR(5) DEFAULT ''XAF'',
            method          VARCHAR(20) NOT NULL,
            status          VARCHAR(20) DEFAULT ''pending'',
            provider_ref    VARCHAR(200),
            provider_status VARCHAR(50),
            phone_number    VARCHAR(20),
            description     TEXT,
            receipt_url     VARCHAR(500),
            webhook_data    JSONB,
            validated_by    BIGINT,
            validated_at    TIMESTAMPTZ,
            failure_reason  TEXT,
            retry_count     SMALLINT DEFAULT 0,
            initiated_at    TIMESTAMPTZ DEFAULT NOW(),
            completed_at    TIMESTAMPTZ
        )', schema_name, schema_name);

    -- Réunions
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.meetings (
            id              BIGSERIAL PRIMARY KEY,
            title           VARCHAR(300) NOT NULL,
            type            VARCHAR(20) DEFAULT ''reunion'',
            event_date      DATE NOT NULL,
            event_time      VARCHAR(5),
            location        VARCHAR(300),
            description     TEXT,
            status          VARCHAR(20) DEFAULT ''upcoming'',
            beneficiary_id  BIGINT REFERENCES %I.members(id),
            total_collected NUMERIC(15,2) DEFAULT 0,
            attendees_count SMALLINT DEFAULT 0,
            notes           TEXT,
            created_by      BIGINT,
            created_at      TIMESTAMPTZ DEFAULT NOW()
        )', schema_name, schema_name);

    -- Présences réunions
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.meeting_presences (
            id              BIGSERIAL PRIMARY KEY,
            meeting_id      BIGINT NOT NULL REFERENCES %I.meetings(id),
            member_id       BIGINT NOT NULL REFERENCES %I.members(id),
            is_present      BOOLEAN DEFAULT FALSE,
            justification   TEXT,
            recorded_at     TIMESTAMPTZ,
            UNIQUE(meeting_id, member_id)
        )', schema_name, schema_name, schema_name);

    -- Tours de passage
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.tour_assignments (
            id              BIGSERIAL PRIMARY KEY,
            member_id       BIGINT UNIQUE NOT NULL REFERENCES %I.members(id),
            order_position  SMALLINT UNIQUE NOT NULL,
            scheduled_date  DATE,
            actual_date     DATE,
            amount_received NUMERIC(15,2) DEFAULT 0,
            status          VARCHAR(20) DEFAULT ''pending'',
            is_manual       BOOLEAN DEFAULT FALSE,
            notes           TEXT,
            created_at      TIMESTAMPTZ DEFAULT NOW()
        )', schema_name, schema_name);

    -- Sanctions
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.sanctions (
            id              BIGSERIAL PRIMARY KEY,
            member_id       BIGINT NOT NULL REFERENCES %I.members(id),
            type            VARCHAR(30) NOT NULL,
            status          VARCHAR(25) DEFAULT ''pending_president'',
            reason          TEXT NOT NULL,
            fine_amount     NUMERIC(15,2) DEFAULT 0,
            start_date      DATE NOT NULL,
            end_date        DATE,
            proposed_by     BIGINT NOT NULL,
            validated_by    BIGINT,
            validated_at    TIMESTAMPTZ,
            lifted_by       BIGINT,
            lifted_at       TIMESTAMPTZ,
            lift_reason     TEXT,
            rejection_reason TEXT,
            created_at      TIMESTAMPTZ DEFAULT NOW()
        )', schema_name, schema_name);

    -- Notifications
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.notifications (
            id          BIGSERIAL PRIMARY KEY,
            member_id   BIGINT NOT NULL REFERENCES %I.members(id),
            meeting_id  BIGINT REFERENCES %I.meetings(id),
            channel     VARCHAR(20) NOT NULL,
            subject     VARCHAR(300),
            body        TEXT NOT NULL,
            status      VARCHAR(20) DEFAULT ''pending'',
            sent_at     TIMESTAMPTZ,
            error_msg   TEXT,
            read_at     TIMESTAMPTZ,
            created_at  TIMESTAMPTZ DEFAULT NOW()
        )', schema_name, schema_name, schema_name);

END;
$$ LANGUAGE plpgsql;

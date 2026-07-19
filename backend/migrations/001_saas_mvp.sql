-- TontineOS SaaS MVP
-- Migration idempotente pour bases déjà initialisées.
-- L'API applique aussi ces changements au démarrage via backend/app/core/bootstrap.py.

CREATE TABLE IF NOT EXISTS organizations (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    logo VARCHAR(500),
    phone VARCHAR(30),
    email VARCHAR(255),
    city VARCHAR(120),
    country VARCHAR(120),
    address TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tontine_registry ADD COLUMN IF NOT EXISTS organization_id BIGINT;
ALTER TABLE tontine_registry ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE tontine_registry ADD COLUMN IF NOT EXISTS contribution_amount NUMERIC(15,2) DEFAULT 50000;
ALTER TABLE tontine_registry ADD COLUMN IF NOT EXISTS frequency VARCHAR(20) DEFAULT 'monthly';
ALTER TABLE tontine_registry ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE tontine_registry ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE tontine_registry ADD COLUMN IF NOT EXISTS max_members INT DEFAULT 20;
ALTER TABLE tontine_registry ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE tontine_members ADD COLUMN IF NOT EXISTS organization_id BIGINT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS organization_id BIGINT;

CREATE TABLE IF NOT EXISTS subscription_plans (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    price_monthly NUMERIC(15,2) NOT NULL DEFAULT 0,
    max_tontines INT,
    max_members INT,
    features JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id),
    plan_id BIGINT NOT NULL REFERENCES subscription_plans(id),
    status VARCHAR(20) DEFAULT 'active',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ends_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscription_payments (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id),
    subscription_id BIGINT REFERENCES subscriptions(id),
    amount NUMERIC(15,2) NOT NULL,
    currency VARCHAR(5) DEFAULT 'XAF',
    payment_method VARCHAR(30),
    payment_reference VARCHAR(120),
    status VARCHAR(20) DEFAULT 'confirmed',
    paid_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO organizations (name, slug, phone, email, city, country, address, status)
VALUES ('Association Bami', 'association_bami', '+237600000000', 'contact@tontine.cm',
        'Yaoundé', 'Cameroun', 'Bastos, Yaoundé', 'active')
ON CONFLICT (slug) DO UPDATE SET updated_at = NOW();

INSERT INTO subscription_plans (code, name, price_monthly, max_tontines, max_members, features)
VALUES
    ('free', 'Gratuit', 0, 1, 20, '["1 tontine","20 membres","Fonctions de base"]'::jsonb),
    ('standard', 'Standard', 15000, 10, 100, '["Rapports PDF","Pénalités","Réunions"]'::jsonb),
    ('premium', 'Premium', 45000, NULL, NULL, '["Prêts","Statistiques avancées","Notifications avancées"]'::jsonb)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    price_monthly = EXCLUDED.price_monthly,
    max_tontines = EXCLUDED.max_tontines,
    max_members = EXCLUDED.max_members,
    features = EXCLUDED.features,
    updated_at = NOW();

UPDATE tontine_registry
SET organization_id = (SELECT id FROM organizations WHERE slug = 'association_bami'),
    description = COALESCE(description, 'Tontine de démonstration'),
    contribution_amount = COALESCE(contribution_amount, 50000),
    frequency = COALESCE(frequency, 'monthly'),
    max_members = COALESCE(max_members, 20)
WHERE organization_id IS NULL;

UPDATE tontine_members tm
SET organization_id = tr.organization_id
FROM tontine_registry tr
WHERE tm.tontine_id = tr.id
  AND tm.organization_id IS NULL;

INSERT INTO subscriptions (organization_id, plan_id, status)
SELECT o.id, p.id, 'active'
FROM organizations o, subscription_plans p
WHERE o.slug = 'association_bami' AND p.code = 'standard'
  AND NOT EXISTS (SELECT 1 FROM subscriptions s WHERE s.organization_id = o.id);

DO $$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN SELECT id, organization_id, schema_name FROM tontine_registry LOOP
        IF rec.schema_name ~ '^tontine_[a-z0-9_]+$' THEN
            EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', rec.schema_name);

            EXECUTE format('ALTER TABLE %I.members ADD COLUMN IF NOT EXISTS organization_id BIGINT', rec.schema_name);
            EXECUTE format('ALTER TABLE %I.members ADD COLUMN IF NOT EXISTS tontine_id BIGINT', rec.schema_name);
            EXECUTE format('ALTER TABLE %I.members ADD COLUMN IF NOT EXISTS photo VARCHAR(500)', rec.schema_name);
            EXECUTE format('ALTER TABLE %I.members ADD COLUMN IF NOT EXISTS profession VARCHAR(160)', rec.schema_name);
            EXECUTE format('ALTER TABLE %I.members ADD COLUMN IF NOT EXISTS address TEXT', rec.schema_name);
            EXECUTE format('ALTER TABLE %I.members ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()', rec.schema_name);

            EXECUTE format('CREATE TABLE IF NOT EXISTS %I.cycles (
                id BIGSERIAL PRIMARY KEY,
                organization_id BIGINT NOT NULL,
                tontine_id BIGINT NOT NULL,
                name VARCHAR(200) NOT NULL,
                start_date DATE NOT NULL,
                end_date DATE,
                expected_total_amount NUMERIC(15,2) DEFAULT 0,
                status VARCHAR(20) DEFAULT ''draft'',
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )', rec.schema_name);

            EXECUTE format('ALTER TABLE %I.cotisations ADD COLUMN IF NOT EXISTS organization_id BIGINT', rec.schema_name);
            EXECUTE format('ALTER TABLE %I.cotisations ADD COLUMN IF NOT EXISTS tontine_id BIGINT', rec.schema_name);
            EXECUTE format('ALTER TABLE %I.cotisations ADD COLUMN IF NOT EXISTS cycle_id BIGINT', rec.schema_name);
            EXECUTE format('ALTER TABLE %I.cotisations ADD COLUMN IF NOT EXISTS closing_date DATE', rec.schema_name);
            EXECUTE format('ALTER TABLE %I.cotisations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()', rec.schema_name);

            EXECUTE format('CREATE TABLE IF NOT EXISTS %I.member_cotisations (
                id BIGSERIAL PRIMARY KEY,
                organization_id BIGINT,
                tontine_id BIGINT,
                member_id BIGINT NOT NULL REFERENCES %I.members(id),
                cotisation_id BIGINT NOT NULL REFERENCES %I.cotisations(id),
                status VARCHAR(20) DEFAULT ''pending'',
                amount_due NUMERIC(15,2) NOT NULL,
                amount_paid NUMERIC(15,2) DEFAULT 0,
                penalty_amount NUMERIC(15,2) DEFAULT 0,
                paid_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW(),
                UNIQUE(member_id, cotisation_id)
            )', rec.schema_name, rec.schema_name, rec.schema_name);

            EXECUTE format('CREATE TABLE IF NOT EXISTS %I.contributions (
                id BIGSERIAL PRIMARY KEY,
                organization_id BIGINT NOT NULL,
                tontine_id BIGINT NOT NULL,
                cycle_id BIGINT REFERENCES %I.cycles(id),
                member_id BIGINT NOT NULL REFERENCES %I.members(id),
                amount NUMERIC(15,2) NOT NULL,
                due_date DATE NOT NULL,
                paid_amount NUMERIC(15,2) DEFAULT 0,
                remaining_amount NUMERIC(15,2) DEFAULT 0,
                status VARCHAR(20) DEFAULT ''pending'',
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )', rec.schema_name, rec.schema_name, rec.schema_name);

            EXECUTE format('ALTER TABLE %I.payments ADD COLUMN IF NOT EXISTS organization_id BIGINT', rec.schema_name);
            EXECUTE format('ALTER TABLE %I.payments ADD COLUMN IF NOT EXISTS tontine_id BIGINT', rec.schema_name);
            EXECUTE format('ALTER TABLE %I.payments ADD COLUMN IF NOT EXISTS contribution_id BIGINT', rec.schema_name);
            EXECUTE format('ALTER TABLE %I.payments ADD COLUMN IF NOT EXISTS payment_date TIMESTAMPTZ DEFAULT NOW()', rec.schema_name);
            EXECUTE format('ALTER TABLE %I.payments ADD COLUMN IF NOT EXISTS cancellation_reason TEXT', rec.schema_name);
            EXECUTE format('ALTER TABLE %I.payments ADD COLUMN IF NOT EXISTS recorded_by BIGINT', rec.schema_name);
            EXECUTE format('ALTER TABLE %I.payments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()', rec.schema_name);

            EXECUTE format('CREATE TABLE IF NOT EXISTS %I.cash_movements (
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
            )', rec.schema_name);

            EXECUTE format('CREATE TABLE IF NOT EXISTS %I.penalties (
                id BIGSERIAL PRIMARY KEY,
                organization_id BIGINT NOT NULL,
                tontine_id BIGINT NOT NULL,
                member_id BIGINT NOT NULL REFERENCES %I.members(id),
                reason TEXT NOT NULL,
                amount NUMERIC(15,2) NOT NULL,
                paid_amount NUMERIC(15,2) DEFAULT 0,
                status VARCHAR(20) DEFAULT ''unpaid'',
                due_date DATE,
                cancellation_reason TEXT,
                created_by BIGINT,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )', rec.schema_name, rec.schema_name);

            EXECUTE format('ALTER TABLE %I.loans ADD COLUMN IF NOT EXISTS organization_id BIGINT', rec.schema_name);
            EXECUTE format('ALTER TABLE %I.loans ADD COLUMN IF NOT EXISTS tontine_id BIGINT', rec.schema_name);
            EXECUTE format('ALTER TABLE %I.loans ADD COLUMN IF NOT EXISTS remaining_amount NUMERIC(15,2) DEFAULT 0', rec.schema_name);
            EXECUTE format('ALTER TABLE %I.loans ADD COLUMN IF NOT EXISTS requested_at TIMESTAMPTZ DEFAULT NOW()', rec.schema_name);
            EXECUTE format('ALTER TABLE %I.loans ADD COLUMN IF NOT EXISTS disbursed_at TIMESTAMPTZ', rec.schema_name);
            EXECUTE format('ALTER TABLE %I.loans ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()', rec.schema_name);

            EXECUTE format('CREATE TABLE IF NOT EXISTS %I.loan_repayments (
                id BIGSERIAL PRIMARY KEY,
                organization_id BIGINT NOT NULL,
                loan_id BIGINT NOT NULL REFERENCES %I.loans(id),
                member_id BIGINT NOT NULL REFERENCES %I.members(id),
                amount NUMERIC(15,2) NOT NULL,
                payment_date TIMESTAMPTZ DEFAULT NOW(),
                payment_method VARCHAR(40),
                recorded_by BIGINT,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )', rec.schema_name, rec.schema_name, rec.schema_name);

            EXECUTE format('CREATE TABLE IF NOT EXISTS %I.payout_turns (
                id BIGSERIAL PRIMARY KEY,
                organization_id BIGINT NOT NULL,
                tontine_id BIGINT NOT NULL,
                cycle_id BIGINT REFERENCES %I.cycles(id),
                member_id BIGINT NOT NULL REFERENCES %I.members(id),
                position INT NOT NULL,
                scheduled_date DATE,
                amount_to_receive NUMERIC(15,2) DEFAULT 0,
                status VARCHAR(20) DEFAULT ''waiting'',
                paid_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )', rec.schema_name, rec.schema_name, rec.schema_name);

            EXECUTE format('CREATE TABLE IF NOT EXISTS %I.payouts (
                id BIGSERIAL PRIMARY KEY,
                organization_id BIGINT NOT NULL,
                tontine_id BIGINT NOT NULL,
                cycle_id BIGINT REFERENCES %I.cycles(id),
                member_id BIGINT REFERENCES %I.members(id),
                amount NUMERIC(15,2) NOT NULL,
                reason TEXT NOT NULL,
                payout_turn_id BIGINT REFERENCES %I.payout_turns(id),
                requested_by BIGINT,
                approved_by BIGINT,
                status VARCHAR(20) DEFAULT ''pending'',
                paid_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )', rec.schema_name, rec.schema_name, rec.schema_name, rec.schema_name);

            EXECUTE format('ALTER TABLE %I.meetings ADD COLUMN IF NOT EXISTS organization_id BIGINT', rec.schema_name);
            EXECUTE format('ALTER TABLE %I.meetings ADD COLUMN IF NOT EXISTS tontine_id BIGINT', rec.schema_name);
            EXECUTE format('ALTER TABLE %I.meetings ADD COLUMN IF NOT EXISTS agenda TEXT', rec.schema_name);
            EXECUTE format('ALTER TABLE %I.meetings ADD COLUMN IF NOT EXISTS report TEXT', rec.schema_name);
            EXECUTE format('ALTER TABLE %I.meetings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()', rec.schema_name);

            EXECUTE format('CREATE TABLE IF NOT EXISTS %I.meeting_attendances (
                id BIGSERIAL PRIMARY KEY,
                meeting_id BIGINT NOT NULL REFERENCES %I.meetings(id),
                member_id BIGINT NOT NULL REFERENCES %I.members(id),
                status VARCHAR(20) DEFAULT ''present'',
                penalty_amount NUMERIC(15,2),
                created_at TIMESTAMPTZ DEFAULT NOW(),
                UNIQUE(meeting_id, member_id)
            )', rec.schema_name, rec.schema_name, rec.schema_name);

            EXECUTE format('CREATE TABLE IF NOT EXISTS %I.receipts (
                id BIGSERIAL PRIMARY KEY,
                organization_id BIGINT NOT NULL,
                tontine_id BIGINT NOT NULL,
                member_id BIGINT NOT NULL REFERENCES %I.members(id),
                payment_id BIGINT,
                number VARCHAR(80) UNIQUE NOT NULL,
                type VARCHAR(40) NOT NULL,
                amount NUMERIC(15,2) NOT NULL,
                payment_method VARCHAR(40),
                payment_reference VARCHAR(120),
                recorded_by BIGINT,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )', rec.schema_name, rec.schema_name);
        END IF;
    END LOOP;
END $$;

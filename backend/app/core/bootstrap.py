import logging

from sqlalchemy import text

from app.common.tenant_schema import ensure_tenant_schema, quote_schema, tenant_sql
from app.core.config import ENABLE_DEMO_DATA, ENVIRONMENT
from app.core.database import TENANT_RE, get_central_engine
from app.core.security import hash_password

logger = logging.getLogger(__name__)

DEMO_PASSWORD = "demo1234"
DEMO_DATA_ENVIRONMENTS = {"development", "test"}

CENTRAL_SQL = [
    """
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
    )
    """,
    "ALTER TABLE tontine_registry ADD COLUMN IF NOT EXISTS organization_id BIGINT",
    "ALTER TABLE tontine_registry ADD COLUMN IF NOT EXISTS description TEXT",
    "ALTER TABLE tontine_registry ADD COLUMN IF NOT EXISTS contribution_amount NUMERIC(15,2) DEFAULT 50000",
    "ALTER TABLE tontine_registry ADD COLUMN IF NOT EXISTS frequency VARCHAR(20) DEFAULT 'monthly'",
    "ALTER TABLE tontine_registry ADD COLUMN IF NOT EXISTS start_date DATE",
    "ALTER TABLE tontine_registry ADD COLUMN IF NOT EXISTS end_date DATE",
    "ALTER TABLE tontine_registry ADD COLUMN IF NOT EXISTS max_members INT DEFAULT 20",
    "ALTER TABLE tontine_registry ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()",
    "ALTER TABLE tontine_members ADD COLUMN IF NOT EXISTS organization_id BIGINT",
    "ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS organization_id BIGINT",
    # ── Vague 1 : refresh tokens révocables (rotation + reuse detection) ──
    """
    CREATE TABLE IF NOT EXISTS refresh_tokens (
        id         BIGSERIAL PRIMARY KEY,
        jti        VARCHAR(36) UNIQUE NOT NULL,
        user_id    BIGINT NOT NULL REFERENCES users(id),
        expires_at TIMESTAMPTZ NOT NULL,
        revoked_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
    )
    """,
    "CREATE INDEX IF NOT EXISTS ix_refresh_tokens_user ON refresh_tokens(user_id)",
    # ── Mobile money : locateur central référence -> schéma tenant (réconciliation webhook) ──
    """
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
    )
    """,
    """
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
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS subscriptions (
        id BIGSERIAL PRIMARY KEY,
        organization_id BIGINT NOT NULL REFERENCES organizations(id),
        plan_id BIGINT NOT NULL REFERENCES subscription_plans(id),
        status VARCHAR(20) DEFAULT 'active',
        started_at TIMESTAMPTZ DEFAULT NOW(),
        ends_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    )
    """,
    """
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
    )
    """,
]


def tenant_sql(schema: str) -> list[str]:
    from app.common.tenant_schema import tenant_sql as build_tenant_sql

    return build_tenant_sql(schema)


async def ensure_saas_schema() -> None:
    engine = get_central_engine()
    async with engine.begin() as conn:
        for sql in CENTRAL_SQL:
            await conn.execute(text(sql))

        await conn.execute(text("""
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
                updated_at = NOW()
        """))

        schemas = (await conn.execute(text("""
            SELECT schema_name FROM tontine_registry WHERE schema_name IS NOT NULL
        """))).scalars().all()

    for schema in schemas:
        await ensure_tenant_schema(schema)

    if ENABLE_DEMO_DATA and ENVIRONMENT not in DEMO_DATA_ENVIRONMENTS:
        logger.warning(
            "Seed des donnees demo ignore: ENVIRONMENT=%s non autorise",
            ENVIRONMENT,
        )
    elif ENABLE_DEMO_DATA:
        await seed_demo_data()
    else:
        logger.info("Seed des donnees demo ignore (ENABLE_DEMO_DATA=false)")


async def ensure_tenant_schema(schema: str) -> None:
    from app.common.tenant_schema import ensure_tenant_schema as ensure_schema

    await ensure_schema(schema)


async def seed_demo_data() -> None:
    engine = get_central_engine()
    demo_hash = hash_password(DEMO_PASSWORD)
    async with engine.begin() as conn:
        await conn.execute(text("""
            INSERT INTO organizations (name, slug, phone, email, city, country, address, status)
            VALUES ('Association Bami', 'association_bami', '+237600000000', 'contact@tontine.cm',
                    'Yaoundé', 'Cameroun', 'Bastos, Yaoundé', 'active')
            ON CONFLICT (slug) DO UPDATE SET updated_at = NOW()
        """))

        await conn.execute(text("""
            INSERT INTO subscriptions (organization_id, plan_id, status)
            SELECT o.id, p.id, 'active'
            FROM organizations o, subscription_plans p
            WHERE o.slug = 'association_bami' AND p.code = 'standard'
              AND NOT EXISTS (SELECT 1 FROM subscriptions s WHERE s.organization_id = o.id)
        """))

        demo_users = [
            ("super@tontine.cm", "+237600000001", "Directeur", "Général", "superadmin"),
            ("admin@tontine.cm", "+237600000002", "Marie", "Ngono", "admin"),
            ("president@tontine.cm", "+237600000003", "François", "Ateba", "president"),
            ("secretaire@tontine.cm", "+237600000004", "Clarisse", "Mbem", "secretaire"),
            ("tresorier@tontine.cm", "+237600000005", "Amina", "Fouda", "tresorier"),
            ("censeur@tontine.cm", "+237600000006", "David", "Essono", "censeur"),
            ("membre@tontine.cm", "+237600000007", "Bernard", "Ndi", "membre"),
            ("membre2@tontine.cm", "+237600000008", "Jeanne", "Mballa", "membre"),
            ("membre3@tontine.cm", "+237600000009", "Paul", "Mvondo", "membre"),
            ("membre4@tontine.cm", "+237600000010", "Cécile", "Abena", "membre"),
            ("membre5@tontine.cm", "+237600000011", "Thomas", "Essomba", "membre"),
        ]
        for email, phone, first, last, role in demo_users:
            await conn.execute(text("""
                INSERT INTO users (email, phone, hashed_password, first_name, last_name, global_role, is_active, is_verified)
                VALUES (:email, :phone, :pwd, :first, :last, :role, true, true)
                ON CONFLICT (email) DO NOTHING
            """), {"email": email, "phone": phone, "pwd": demo_hash, "first": first, "last": last, "role": role})

        user_ids = dict((await conn.execute(text("""
            SELECT email, id FROM users
            WHERE email = ANY(:emails)
        """), {"emails": [email for email, *_ in demo_users]})).all())
        org_id = (await conn.execute(text("""
            SELECT id FROM organizations WHERE slug = 'association_bami'
        """))).scalar_one()
        super_id = user_ids["super@tontine.cm"]
        admin_id = user_ids["admin@tontine.cm"]
        president_id = user_ids["president@tontine.cm"]
        secretaire_id = user_ids["secretaire@tontine.cm"]
        tresorier_id = user_ids["tresorier@tontine.cm"]
        censeur_id = user_ids["censeur@tontine.cm"]

        await conn.execute(text("""
            INSERT INTO tontine_registry (
                organization_id, name, slug, schema_name, type, status, currency,
                created_by, description, contribution_amount, frequency, max_members
            )
            VALUES (
                :org, 'Tontine Bami', 'bami', 'tontine_bami', 'mixte', 'active', 'XAF',
                :super, 'Tontine de démonstration', 50000, 'monthly', 20
            )
            ON CONFLICT (slug) DO UPDATE SET
                organization_id = EXCLUDED.organization_id,
                status = EXCLUDED.status,
                contribution_amount = EXCLUDED.contribution_amount,
                frequency = EXCLUDED.frequency,
                max_members = EXCLUDED.max_members,
                updated_at = NOW()
        """), {"org": org_id, "super": super_id})

        await conn.execute(text("""
            INSERT INTO tontine_admin_assignments (user_id, tontine_id)
            SELECT :admin, tr.id FROM tontine_registry tr WHERE tr.slug = 'bami'
            ON CONFLICT DO NOTHING
        """), {"admin": admin_id})

        await conn.execute(text("""
            UPDATE tontine_members tm
            SET organization_id = tr.organization_id
            FROM tontine_registry tr
            WHERE tm.tontine_id = tr.id
              AND tm.organization_id IS NULL
        """))

        ctx = (await conn.execute(text("""
            SELECT tr.id AS tontine_id, tr.schema_name, tr.organization_id
            FROM tontine_registry tr
            WHERE tr.slug = 'bami'
        """))).mappings().one_or_none()
        if not ctx:
            return
        schema = ctx["schema_name"]
        if not TENANT_RE.match(schema):
            return
        for sql in tenant_sql(schema):
            await conn.execute(text(sql))
        s = quote_schema(schema)
        org_id = int(ctx["organization_id"])
        tontine_id = int(ctx["tontine_id"])

        await conn.execute(text(f"""
            INSERT INTO tontine_members (organization_id, user_id, tontine_id, role, status, joined_at)
            SELECT :org, u.id, :tid, u.global_role, 'active', NOW()
            FROM users u
            WHERE u.email IN (
                'admin@tontine.cm','president@tontine.cm','secretaire@tontine.cm',
                'tresorier@tontine.cm','censeur@tontine.cm','membre@tontine.cm',
                'membre2@tontine.cm','membre3@tontine.cm','membre4@tontine.cm','membre5@tontine.cm'
            )
            ON CONFLICT DO NOTHING
        """), {"org": org_id, "tid": tontine_id})

        await conn.execute(text(f"""
            INSERT INTO {s}.tontine_config (
                name, description, type, frequency, status,
                currency, cotisation_amount, max_members, loan_interest_rate,
                penalty_rate, grace_days, start_date
            )
            VALUES (
                'Tontine Bami', 'Tontine de démonstration', 'mixte',
                'monthly', 'active', 'XAF', 50000, 20, 5.00, 5.00, 3, DATE '2024-01-15'
            )
            ON CONFLICT DO NOTHING
        """))

        await conn.execute(text(f"""
            INSERT INTO {s}.members (organization_id, tontine_id, user_id, status, role, tour_order, joined_at)
            SELECT :org, :tid, u.id, 'active', u.global_role,
                   ROW_NUMBER() OVER (ORDER BY u.id), DATE '2024-01-15'
            FROM users u
            WHERE u.email IN (
                'president@tontine.cm','secretaire@tontine.cm','tresorier@tontine.cm',
                'censeur@tontine.cm','membre@tontine.cm','membre2@tontine.cm',
                'membre3@tontine.cm','membre4@tontine.cm','membre5@tontine.cm'
            )
            ON CONFLICT (user_id) DO UPDATE SET
                organization_id = EXCLUDED.organization_id,
                tontine_id = EXCLUDED.tontine_id,
                status = 'active',
                role = EXCLUDED.role
        """), {"org": org_id, "tid": tontine_id})

        await conn.execute(text(f"""
            INSERT INTO {s}.cycles (organization_id, tontine_id, name, start_date, end_date, expected_total_amount, status)
            SELECT :org, :tid, 'Cycle 2026', DATE '2026-01-01', DATE '2026-12-31', 5400000, 'active'
            WHERE NOT EXISTS (SELECT 1 FROM {s}.cycles WHERE name = 'Cycle 2026')
        """), {"org": org_id, "tid": tontine_id})

        cycle_id = (await conn.execute(text(f"SELECT id FROM {s}.cycles WHERE name = 'Cycle 2026'"))).scalar()
        for label, due, closing in [
            ("Cotisation Avril 2026", "2026-04-01", "2026-04-30"),
            ("Cotisation Mai 2026", "2026-05-01", "2026-05-31"),
            ("Cotisation Juin 2026", "2026-06-01", "2026-06-30"),
        ]:
            await conn.execute(text(f"""
            INSERT INTO {s}.cotisations (organization_id, tontine_id, cycle_id, label, amount, due_date, closing_date, status, created_by)
                VALUES (:org, :tid, :cycle, :label, 50000, :due, :closing, 'open', :by)
                ON CONFLICT (label) DO UPDATE SET
                    organization_id = EXCLUDED.organization_id,
                    tontine_id = EXCLUDED.tontine_id,
                    cycle_id = EXCLUDED.cycle_id
            """), {
                "org": org_id, "tid": tontine_id, "cycle": cycle_id,
                "label": label, "due": due, "closing": closing, "by": super_id,
            })

        await conn.execute(text(f"""
            INSERT INTO {s}.member_cotisations (organization_id, tontine_id, member_id, cotisation_id, status, amount_due, amount_paid, paid_at)
            SELECT :org, :tid, m.id, c.id,
                   CASE
                       WHEN c.label = 'Cotisation Avril 2026' THEN 'paid'
                       WHEN c.label = 'Cotisation Mai 2026' AND m.id % 3 = 0 THEN 'partial'
                       WHEN c.label = 'Cotisation Juin 2026' THEN 'pending'
                       ELSE 'paid'
                   END,
                   c.amount,
                   CASE
                       WHEN c.label = 'Cotisation Avril 2026' THEN c.amount
                       WHEN c.label = 'Cotisation Mai 2026' AND m.id % 3 = 0 THEN 25000
                       WHEN c.label = 'Cotisation Juin 2026' THEN 0
                       ELSE c.amount
                   END,
                   CASE WHEN c.label = 'Cotisation Avril 2026' THEN NOW() ELSE NULL END
            FROM {s}.members m CROSS JOIN {s}.cotisations c
            WHERE m.status = 'active'
            ON CONFLICT (member_id, cotisation_id) DO NOTHING
        """), {"org": org_id, "tid": tontine_id})

        await conn.execute(text(f"""
            INSERT INTO {s}.payments (organization_id, tontine_id, reference, member_id, amount, method, status, description, validated_by, validated_at, payment_date, completed_at, recorded_by)
            SELECT :org, :tid, 'TOS-DEMO-AVR-' || m.id, m.id, 50000, 'especes', 'success',
                   'Cotisation Avril 2026', :by, NOW(), NOW(), NOW(), :by
            FROM {s}.members m
            WHERE m.status = 'active'
            ON CONFLICT (reference) DO NOTHING
        """), {"org": org_id, "tid": tontine_id, "by": tresorier_id})

        await conn.execute(text(f"""
            INSERT INTO {s}.cash_movements (organization_id, tontine_id, type, category, amount, description, reference_type, reference_id, created_by)
            SELECT :org, :tid, 'income', 'contribution', p.amount, p.description, 'payment', p.id, COALESCE(p.recorded_by, :by)
            FROM {s}.payments p
            WHERE p.status = 'success'
              AND NOT EXISTS (
                SELECT 1 FROM {s}.cash_movements cm
                WHERE cm.reference_type = 'payment' AND cm.reference_id = p.id
              )
        """), {"org": org_id, "tid": tontine_id, "by": tresorier_id})

        await conn.execute(text(f"""
            INSERT INTO {s}.penalties (organization_id, tontine_id, member_id, reason, amount, status, due_date, created_by)
            SELECT :org, :tid, m.id, 'Retard de cotisation', 2000, 'unpaid', CURRENT_DATE + 7, :by
            FROM {s}.members m
            WHERE m.status = 'active'
              AND NOT EXISTS (
                SELECT 1 FROM {s}.penalties p
                WHERE p.member_id = m.id AND p.reason = 'Retard de cotisation'
              )
            ORDER BY m.id
            LIMIT 2
        """), {"org": org_id, "tid": tontine_id, "by": censeur_id})

        await conn.execute(text(f"""
            INSERT INTO {s}.sanctions (organization_id, tontine_id, member_id, type, status, reason, fine_amount, start_date, proposed_by, validated_by, validated_at)
            SELECT :org, :tid, m.id, 'Retard paiement', 'active', 'Cotisation payée en retard', 2000, CURRENT_DATE - 10, :proposed_by, :validated_by, NOW()
            FROM {s}.members m
            WHERE m.status = 'active'
              AND NOT EXISTS (
                SELECT 1 FROM {s}.sanctions sx
                WHERE sx.member_id = m.id
                  AND sx.type = 'Retard paiement'
                  AND sx.reason = 'Cotisation payée en retard'
              )
            ORDER BY m.id
            LIMIT 1
        """), {
            "org": org_id, "tid": tontine_id,
            "proposed_by": censeur_id, "validated_by": president_id,
        })

        await conn.execute(text(f"""
            INSERT INTO {s}.loans (organization_id, tontine_id, member_id, amount, interest_rate, duration_months,
                                   total_interest, total_due, monthly_payment, amount_paid, remaining_amount,
                                   status, start_date, purpose, approved_by, approved_at, disbursed_at)
            SELECT :org, :tid, m.id, 150000, 5, 3, 1875, 151875, 50625, 50625, 101250,
                   'active', CURRENT_DATE - 30, 'Commerce', :by, NOW(), NOW()
            FROM {s}.members m
            WHERE m.status = 'active'
              AND NOT EXISTS (
                SELECT 1 FROM {s}.loans l
                WHERE l.member_id = m.id AND l.purpose = 'Commerce' AND l.amount = 150000
              )
            ORDER BY m.id
            LIMIT 1
        """), {"org": org_id, "tid": tontine_id, "by": president_id})

        await conn.execute(text(f"""
            INSERT INTO {s}.meetings (organization_id, tontine_id, title, event_date, event_time, location, description, agenda, status, total_collected, attendees_count, created_by)
            SELECT :org, :tid, 'Réunion mensuelle Juin 2026', DATE '2026-06-15', '15:00', 'Bastos, Yaoundé',
                   'Réunion mensuelle', 'Cotisations, prêts, tour de passage', 'upcoming', 0, 0, :by
            WHERE NOT EXISTS (SELECT 1 FROM {s}.meetings WHERE title = 'Réunion mensuelle Juin 2026')
        """), {"org": org_id, "tid": tontine_id, "by": secretaire_id})

        await conn.execute(text(f"""
            INSERT INTO {s}.tour_assignments (member_id, order_position, scheduled_date, amount_received, status)
            SELECT m.id, ROW_NUMBER() OVER (ORDER BY m.tour_order), DATE '2026-01-15' + ((ROW_NUMBER() OVER (ORDER BY m.tour_order) - 1) * INTERVAL '1 month'),
                   CASE WHEN ROW_NUMBER() OVER (ORDER BY m.tour_order) <= 2 THEN 450000 ELSE 0 END,
                   CASE WHEN ROW_NUMBER() OVER (ORDER BY m.tour_order) <= 2 THEN 'completed' ELSE 'pending' END
            FROM {s}.members m
            WHERE m.status = 'active'
            ON CONFLICT DO NOTHING
        """))

        await conn.execute(text(f"""
            INSERT INTO {s}.payout_turns (organization_id, tontine_id, cycle_id, member_id, position, scheduled_date, amount_to_receive, status, paid_at)
            SELECT :org, :tid, :cycle, ta.member_id, ta.order_position, ta.scheduled_date, 450000,
                   CASE WHEN ta.status = 'completed' THEN 'paid' ELSE 'waiting' END,
                   CASE WHEN ta.status = 'completed' THEN NOW() ELSE NULL END
            FROM {s}.tour_assignments ta
            ON CONFLICT (cycle_id, member_id) DO NOTHING
        """), {"org": org_id, "tid": tontine_id, "cycle": cycle_id})

        await conn.execute(text(f"""
            INSERT INTO {s}.notifications (organization_id, member_id, channel, subject, body, type, status, is_read, link)
            SELECT :org, m.id, 'app', 'Cotisation Juin à payer', 'Votre cotisation de Juin 2026 est disponible.',
                   'contribution_due', 'sent', false, '/member/contributions'
            FROM {s}.members m
            WHERE m.status = 'active'
              AND NOT EXISTS (
                SELECT 1 FROM {s}.notifications n
                WHERE n.member_id = m.id
                  AND n.subject = 'Cotisation Juin à payer'
                  AND n.type = 'contribution_due'
              )
        """), {"org": org_id})



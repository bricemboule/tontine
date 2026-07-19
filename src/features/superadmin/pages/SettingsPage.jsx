import { PageHeader, Card, Badge } from "@/design-system";

const ITEMS = [
  ["Sécurité", "JWT, rôles et isolation par organisation actifs côté API"],
  ["Migrations", "Migration SQL disponible dans backend/migrations/001_saas_mvp.sql"],
];

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Paramètres SaaS" subtitle="Configuration plateforme" />
      <Card>
        {ITEMS.map(([name, desc]) => (
          <div key={name} className="flex items-center gap-3 border-b border-line-soft px-5 py-3.5 last:border-0">
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-ink">{name}</div>
              <div className="text-[11.5px] text-ink-subtle">{desc}</div>
            </div>
            <Badge variant="success" dot>Actif</Badge>
          </div>
        ))}
      </Card>
    </>
  );
}

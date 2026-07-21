import { ACTOR_DASHBOARD_CSS, Hero, Kpi, Panel, Table, fmtCFA } from "./components";

const STATUS_META = {
  active: { label: "Active", cls: "" },
  draft: { label: "Brouillon", cls: "warn" },
  pending: { label: "En attente", cls: "warn" },
  suspended: { label: "Suspendue", cls: "bad" },
  inactive: { label: "Inactive", cls: "bad" },
};

function StatusPill({ status }) {
  const meta = STATUS_META[status] || { label: status || "—", cls: "" };
  return <span className={`actor-status ${meta.cls}`}>{meta.label}</span>;
}

function fmtDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("fr-FR");
}

function EmptyState({ children }) {
  return (
    <div style={{ padding: "26px 10px", textAlign: "center", color: "var(--text-subtle)", fontSize: 12.5 }}>
      {children}
    </div>
  );
}

export function SuperadminHomeMock({ stats, tontines = [], organizations = [] }) {
  const tone = "#6d2ee6";
  const lastTontines = [...tontines].slice(0, 5);
  const lastOrgs = [...organizations].slice(0, 5);

  return (
    <div className="actor-board">
      <style>{ACTOR_DASHBOARD_CSS}</style>
      <Hero title="Bienvenue, Superadmin 👋" sub="Vue d'ensemble de la plateforme" />
      <div className="actor-kpis k6">
        <Kpi icon="▦" value={stats?.total_organizations ?? "—"} label="Organisations" tone={tone} />
        <Kpi icon="◉" value={stats?.total_tontines ?? "—"} label="Tontines" tone={tone} />
        <Kpi icon="▴" value={fmtCFA(stats?.revenus_saas)} label="Revenus SaaS" tone="#2563eb" bg="#eff6ff" />
        <Kpi icon="▣" value={stats?.active_tontines ?? "—"} label="Tontines actives" tone="#14b8a6" bg="#ecfeff" />
        <Kpi icon="!" value={stats?.suspended_organizations ?? "—"} label="Organisations suspendues" bad tone="#ef4444" bg="#fff1f2" />
        <Kpi icon="□" value={stats?.total_users ?? "—"} label="Utilisateurs" tone="#f97316" bg="#fff7ed" />
      </div>
      <div className="actor-grid equal">
        <Panel title="Dernières tontines créées">
          {lastTontines.length === 0 ? (
            <EmptyState>Aucune tontine pour le moment.</EmptyState>
          ) : (
            <Table
              columns={["Tontine", "Administrateur", "Membres", "Statut"]}
              rows={lastTontines.map((t) => [
                t.name,
                t.admin?.name || "Non attribué",
                t.members_count ?? 0,
                <StatusPill key={t.id} status={t.status} />,
              ])}
            />
          )}
        </Panel>
        <Panel title="Dernières organisations inscrites">
          {lastOrgs.length === 0 ? (
            <EmptyState>Aucune organisation pour le moment.</EmptyState>
          ) : (
            <Table
              columns={["Organisation", "Plan", "Date", "Statut"]}
              rows={lastOrgs.map((o) => [
                o.name,
                o.plan_name || "Gratuit",
                fmtDate(o.created_at),
                <StatusPill key={o.id} status={o.status} />,
              ])}
            />
          )}
        </Panel>
      </div>
    </div>
  );
}

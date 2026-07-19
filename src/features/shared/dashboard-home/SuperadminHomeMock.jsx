import { ACTOR_DASHBOARD_CSS, AreaChart, Donut, Hero, Kpi, Panel, Table, fmtCFA } from "./components";

export function SuperadminHomeMock({ stats }) {
  const tone = "#6d2ee6";
  return (
    <div className="actor-board">
      <style>{ACTOR_DASHBOARD_CSS}</style>
      <Hero title="Bienvenue, Superadmin 👋" sub="Vue d'ensemble de la plateforme" />
      <div className="actor-kpis k6">
        <Kpi icon="▦" value={stats?.total_organizations ?? "—"} label="Organisations" tone={tone} />
        <Kpi icon="◉" value={stats?.total_tontines ?? "—"} label="Tontines" tone={tone} />
        <Kpi icon="▴" value={fmtCFA(stats?.revenus_saas)} label="Revenus SaaS" tone="#2563eb" bg="#eff6ff" />
        <Kpi icon="▣" value={stats?.active_organizations ?? "—"} label="Organisations actives" tone="#14b8a6" bg="#ecfeff" />
        <Kpi icon="!" value={stats?.suspended_organizations ?? "—"} label="Organisations suspendues" bad tone="#ef4444" bg="#fff1f2" />
        <Kpi icon="□" value={stats?.total_users ?? "—"} label="Utilisateurs" tone="#f97316" bg="#fff7ed" />
      </div>
      <div className="actor-grid">
        <Panel title="Revenus SaaS (12 derniers mois)" sub="Année en cours"><AreaChart tone={tone} /></Panel>
        <Panel title="Alertes système">
          <div className="actor-list">
            <div className="actor-alert bad">△ 5 organisations expirent dans 7 jours</div>
            <div className="actor-alert">● 3 paiements échoués</div>
            <div className="actor-alert">△ 2 organisations suspendues</div>
            <div className="actor-alert good">○ Sauvegarde effectuée il y a 1 heure</div>
          </div>
        </Panel>
      </div>
      <div className="actor-grid equal">
        <Panel title="Dernières organisations inscrites">
          <Table columns={["Organisation", "Plan", "Date", "Statut"]} rows={[
            ["Tontine Solidarité Plus", "Standard", "12/05/2024", <span className="actor-status">Active</span>],
            ["Épargne Communautaire", "Premium", "11/05/2024", <span className="actor-status">Active</span>],
            ["Tontine Ojamana", "Gratuit", "10/05/2024", <span className="actor-status">Active</span>],
            ["Union des Femmes", "Standard", "09/05/2024", <span className="actor-status">Active</span>],
          ]} />
        </Panel>
        <Panel title="Paiements récents">
          <Table columns={["Tontine", "Montant"]} rows={[
            ["Tontine Solidarité Plus", fmtCFA(50000)],
            ["Épargne Communautaire", fmtCFA(100000)],
            ["Tontine Ojamana", fmtCFA(75000)],
            ["Union des Femmes", fmtCFA(150000)],
          ]} />
        </Panel>
      </div>
    </div>
  );
}

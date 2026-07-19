import { ACTOR_DASHBOARD_CSS, AreaChart, Donut, Hero, Kpi, Panel, Table, fmtCFA } from "./components";

export function AdminHomeMock({ dashboard }) {
  const tone = "#16a34a";
  return (
    <div className="actor-board">
      <style>{ACTOR_DASHBOARD_CSS}</style>
      <Hero title="Bonjour, Administrateur 👋" sub="Vue d'ensemble de votre organisation" />
      <div className="actor-kpis k6">
        <Kpi icon="▥" value={dashboard?.upcoming_meetings ?? "—"} label="Réunions à venir" tone={tone} bg="#ecfdf5" />
        <Kpi icon="♣" value={dashboard?.members_count ?? "—"} label="Membres actifs" tone="#2563eb" bg="#eff6ff" />
        <Kpi icon="▣" value={fmtCFA(dashboard?.cash_balance)} label="Solde caisse" tone={tone} bg="#ecfdf5" />
        <Kpi icon="↗" value={fmtCFA(dashboard?.expected_contributions)} label="Cotisations attendues" tone={tone} bg="#ecfdf5" />
        <Kpi icon="✓" value={fmtCFA(dashboard?.collected_contributions)} label="Cotisations encaissées" tone={tone} bg="#ecfdf5" />
        <Kpi icon="◷" value={dashboard?.late_contributions ?? "—"} label="Cotisations en retard" bad tone="#f97316" bg="#fff7ed" />
      </div>
      <div className="actor-grid">
        <Panel title="Tontines actives">
          <Table columns={["Tontine", "Membres", "Cotisation", "Fréquence", "Statut"]} rows={[
            ["Tontine Élévation", "25", fmtCFA(10000), "Hebdomadaire", <span className="actor-status">Active</span>],
            ["Tontine Avenir", "20", fmtCFA(15000), "Mensuelle", <span className="actor-status">Active</span>],
            ["Tontine Progrès", "21", fmtCFA(20000), "Mensuelle", <span className="actor-status">Active</span>],
            ["Tontine Solidarité", "20", fmtCFA(10000), "Hebdomadaire", <span className="actor-status">Active</span>],
          ]} />
        </Panel>
        <Panel title="Actions rapides">
          <div className="actor-actions">
            <button className="actor-action" style={{ "--tone": "#16a34a" }}>+ Créer une tontine</button>
            <button className="actor-action" style={{ "--tone": "#2563eb" }}>+ Ajouter un membre</button>
            <button className="actor-action" style={{ "--tone": "#7c3aed" }}>▣ Enregistrer un paiement</button>
            <button className="actor-action" style={{ "--tone": "#f97316" }}>▤ Générer un rapport</button>
          </div>
        </Panel>
      </div>
      <div className="actor-grid">
        <Panel title="Activités récentes">
          <div className="actor-list">
            {["Paiement enregistré pour Marie Claire - 10 000 FCFA", "Nouveau membre ajouté : Paul Martin", "Réunion planifiée : Tontine Élévation", "Pénalité ajoutée pour retard de cotisation"].map((item, index) => (
              <div className="actor-line" key={item}><div className="actor-line-main">ⓘ {item}</div><div className="actor-line-sub">Il y a {index + 1}h</div></div>
            ))}
          </div>
        </Panel>
        <Panel title="Répartition des cotisations"><Donut tone={tone} /></Panel>
      </div>
    </div>
  );
}

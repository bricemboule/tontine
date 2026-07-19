import { ACTOR_DASHBOARD_CSS, AreaChart, Donut, Hero, Kpi, Panel, Table, fmtCFA } from "./components";

export function TresorierHomeMock({ dashboard }) {
  return (
    <div className="actor-board">
      <style>{ACTOR_DASHBOARD_CSS}</style>
      <Hero title="Gestion financière 👋" sub="Gestion Trésorerie quotidienne" />
      <div className="actor-kpis k6">
        <Kpi icon="◷" value={fmtCFA(dashboard?.collected_contributions)} label="Total encaissé" tone="#f97316" bg="#fff7ed" />
        <Kpi icon="♙" value={fmtCFA(dashboard?.expected_contributions)} label="Total attendu" tone="#f97316" bg="#fff7ed" />
        <Kpi icon="%" value={dashboard?.late_contributions ?? "—"} label="En retard" bad tone="#ef4444" bg="#fff1f2" />
        <Kpi icon="▣" value={dashboard?.unpaid_penalties ?? "—"} label="Pénalités impayées" tone="#f97316" bg="#fff7ed" />
        <Kpi icon="□" value={dashboard?.active_loans ?? "—"} label="Prêts actifs" tone="#f97316" bg="#fff7ed" />
        <Kpi icon="✓" value={fmtCFA(dashboard?.cash_balance)} label="Solde disponible" tone="#16a34a" bg="#ecfdf5" />
      </div>
      <div className="actor-grid">
        <Panel title="Enregistrement rapide">
          <div className="actor-form">
            <select className="actor-input"><option>Sélectionner un membre</option></select>
            <input className="actor-input" placeholder="0 FCFA" />
            <select className="actor-input"><option>Espèces</option><option>Mobile Money</option></select>
            <input className="actor-input" placeholder="Référence paiement" />
            <button className="actor-submit">Enregistrer le paiement</button>
          </div>
        </Panel>
        <Panel title="Paiements récents">
          <Table columns={["Membre", "Montant", "Méthode", "Date"]} rows={[
            ["Marie Claire", fmtCFA(10000), "Espèces", "12/05/2024"],
            ["Paul Martin", fmtCFA(15000), "Mobile Money", "12/05/2024"],
            ["Jean Dupont", fmtCFA(10000), "Espèces", "11/05/2024"],
            ["Sophie Durand", fmtCFA(20000), "Mobile Money", "11/05/2024"],
          ]} />
        </Panel>
      </div>
      <div className="actor-grid equal">
        <Panel title="Cotisations en retard">
          <Table columns={["Membre", "Montant", "Retard"]} rows={[
            ["Marie Claire", fmtCFA(10000), <span className="actor-status bad">5 jours</span>],
            ["Jean Dupont", fmtCFA(10000), <span className="actor-status bad">3 jours</span>],
            ["Lucie Bernard", fmtCFA(10000), <span className="actor-status bad">2 jours</span>],
          ]} />
        </Panel>
        <Panel title="Actions rapides">
          <div className="actor-actions">
            <button className="actor-action" style={{ "--tone": "#f97316" }}>+ Enregistrer une pénalité</button>
            <button className="actor-action" style={{ "--tone": "#2563eb" }}>+ Enregistrer remboursement prêt</button>
            <button className="actor-action" style={{ "--tone": "#16a34a" }}>▣ Générer un reçu</button>
            <button className="actor-action" style={{ "--tone": "#7c3aed" }}>▤ Rapport de caisse</button>
          </div>
        </Panel>
      </div>
    </div>
  );
}

import { ACTOR_DASHBOARD_CSS, AreaChart, Donut, Hero, Kpi, Panel, Table, fmtCFA } from "./components";

export function PresidentHomeMock({ dashboard }) {
  return (
    <div className="actor-board">
      <style>{ACTOR_DASHBOARD_CSS}</style>
      <Hero title="Bonjour Président 👋" sub="Vue de pilotage et de validation" />
      <div className="actor-kpis k6">
        <Kpi icon="▣" value={fmtCFA(dashboard?.cash_balance)} label="Solde caisse" tone="#2563eb" bg="#eff6ff" />
        <Kpi icon="♣" value={dashboard?.members_count ?? "—"} label="Membres actifs" tone="#2563eb" bg="#eff6ff" />
        <Kpi icon="%" value={dashboard?.late_contributions ?? "—"} label="En retard" bad tone="#ef4444" bg="#fff1f2" />
        <Kpi icon="●" value="4" label="Décaissements à valider" tone="#2563eb" bg="#eff6ff" />
        <Kpi icon="▥" value={dashboard?.active_loans ?? "—"} label="Prêts actifs" tone="#2563eb" bg="#eff6ff" />
        <Kpi icon="□" value={dashboard?.upcoming_meetings ?? "—"} label="Réunions à venir" tone="#7c3aed" bg="#f5f3ff" />
      </div>
      <div className="actor-grid">
        <Panel title="Demandes de validation">
          <Table columns={["Type", "Montant", "Demandeur", "Date", "Action"]} rows={[
            ["Décaissement", fmtCFA(200000), "Trésorier", "12/06/2024", <span className="actor-pill" style={{ "--tone": "#2563eb", "--tone-bg": "#eff6ff" }}>Valider</span>],
            ["Prêt", fmtCFA(150000), "Marie Claire", "12/06/2024", <span className="actor-pill" style={{ "--tone": "#2563eb", "--tone-bg": "#eff6ff" }}>Valider</span>],
            ["Décaissement", fmtCFA(100000), "Trésorier", "11/06/2024", <span className="actor-pill" style={{ "--tone": "#2563eb", "--tone-bg": "#eff6ff" }}>Valider</span>],
          ]} />
        </Panel>
        <Panel title="Résumé financier">
          <div className="actor-list">
            <div><div className="actor-line-sub">Total encaissé</div><div className="actor-money">{fmtCFA(2000000)}</div></div>
            <div><div className="actor-line-sub">Total retiré</div><div className="actor-money">{fmtCFA(850000)}</div></div>
            <div><div className="actor-line-sub">Pénalités</div><div className="actor-money">{fmtCFA(35000)}</div></div>
            <div><div className="actor-line-sub">Solde</div><div className="actor-money">{fmtCFA(3250000)}</div></div>
          </div>
        </Panel>
      </div>
      <div className="actor-grid equal">
        <Panel title="Activités sensibles">
          <div className="actor-list">
            <div className="actor-alert">△ 3 cotisations en retard important</div>
            <div className="actor-alert">△ 2 prêts dépassent la date limite</div>
            <div className="actor-alert">△ 1 décaissement urgent à valider</div>
          </div>
        </Panel>
        <Panel title="Prochaines réunions">
          <div className="actor-list">
            <div className="actor-line"><div className="actor-line-main">Réunion mensuelle</div><div className="actor-line-sub">18/05/2024 - 10:00</div></div>
            <div className="actor-line"><div className="actor-line-main">Réunion extraordinaire</div><div className="actor-line-sub">25/05/2024 - 14:00</div></div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

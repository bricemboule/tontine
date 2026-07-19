import { ACTOR_DASHBOARD_CSS, AreaChart, Donut, Hero, Kpi, Panel, Table, fmtCFA } from "./components";

export function MemberHomeMock({ user, dashboard }) {
  const firstName = (user?.name || "Jean Dupont").split(" ")[0] || "Jean";
  return (
    <div className="actor-board">
      <style>{ACTOR_DASHBOARD_CSS}</style>
      <Hero title={`Bonjour, ${firstName} 👋`} sub="Voici votre espace personnel" />
      <div className="actor-kpis k6">
        <Kpi icon="▣" value={fmtCFA(dashboard?.total_contributed)} label="Total cotisé" tone="#0891b2" bg="#ecfeff" />
        <Kpi icon="▣" value={fmtCFA(dashboard?.remaining_contributions)} label="Montant restant" tone="#14b8a6" bg="#ecfdf5" />
        <Kpi icon="!" value={fmtCFA(dashboard?.penalties)} label="Pénalités" bad tone="#ef4444" bg="#fff1f2" />
        <Kpi icon="□" value={dashboard?.next_payment || "—"} label="Prochain paiement" tone="#0891b2" bg="#ecfeff" />
        <Kpi icon="◷" value={dashboard?.payout_turn ?? "—"} label="Mon tour de passage" tone="#7c3aed" bg="#f5f3ff" />
        <Kpi icon="▣" value={dashboard?.active_loans ?? "—"} label="Prêts actifs" tone="#d946ef" bg="#fdf4ff" />
      </div>
      <div className="actor-grid">
        <Panel title="Mes dernières cotisations">
          <Table columns={["Date", "Montant", "Statut", "Reçu"]} rows={[
            ["10/06/2024", fmtCFA(10000), <span className="actor-status">Payé</span>, "▧"],
            ["03/05/2024", fmtCFA(10000), <span className="actor-status">Payé</span>, "▧"],
            ["26/04/2024", fmtCFA(10000), <span className="actor-status">Payé</span>, "▧"],
            ["19/04/2024", fmtCFA(10000), <span className="actor-status bad">En retard</span>, "▧"],
          ]} />
        </Panel>
        <Panel title="Notifications récentes">
          <div className="actor-list">
            <div className="actor-line"><div className="actor-line-main">▣ Paiement confirmé</div><div className="actor-line-sub">Il y a 5 min</div></div>
            <div className="actor-line"><div className="actor-line-main">▣ Réunion prévue</div><div className="actor-line-sub">Il y a 1h</div></div>
            <div className="actor-line"><div className="actor-line-main">▣ Vous avez un retard</div><div className="actor-line-sub">Il y a 2h</div></div>
            <div className="actor-line"><div className="actor-line-main">▣ Nouveau reçu disponible</div><div className="actor-line-sub">Il y a 1 jour</div></div>
          </div>
        </Panel>
      </div>
      <div className="actor-grid equal">
        <Panel title="Prochaines réunions">
          <div className="actor-list">
            <div className="actor-line"><div className="actor-line-main">Réunion mensuelle</div><div className="actor-line-sub">18/05/2024 - 10:00 · Salle A</div></div>
            <div className="actor-line"><div className="actor-line-main">Réunion extraordinaire</div><div className="actor-line-sub">25/05/2024 - 14:00 · Salle B</div></div>
          </div>
        </Panel>
        <Panel title="Mes reçus récents">
          <div className="actor-list">
            <div className="actor-line"><div className="actor-line-main">Reçu #1256</div><div className="actor-line-sub">10/05/2024</div></div>
            <div className="actor-line"><div className="actor-line-main">Reçu #1245</div><div className="actor-line-sub">03/05/2024</div></div>
            <div className="actor-line"><div className="actor-line-main">Reçu #1239</div><div className="actor-line-sub">26/04/2024</div></div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

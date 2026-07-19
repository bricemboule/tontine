import { ACTOR_DASHBOARD_CSS, AreaChart, Donut, Hero, Kpi, Panel, Table, fmtCFA } from "./components";

export function SecretaireHomeMock({ dashboard }) {
  const tone = "#7c3aed";
  return (
    <div className="actor-board">
      <style>{ACTOR_DASHBOARD_CSS}</style>
      <Hero title="Bonjour Secrétaire 👋" sub="Gestion des réunions et documents" />
      <div className="actor-kpis k6">
        <Kpi icon="▣" value={dashboard?.upcoming_meetings ?? "—"} label="Réunions programmées" tone={tone} bg="#f5f3ff" />
        <Kpi icon="♣" value={dashboard?.members_count ?? "—"} label="Membres actifs" tone="#16a34a" bg="#ecfdf5" />
        <Kpi icon="♡" value={dashboard?.late_contributions ?? "—"} label="Cotisations en retard" bad tone="#ef4444" bg="#fff1f2" />
        <Kpi icon="▤" value={fmtCFA(dashboard?.collected_contributions)} label="Cotisations encaissées" tone={tone} bg="#f5f3ff" />
        <Kpi icon="□" value={dashboard?.unpaid_penalties ?? "—"} label="Pénalités impayées" tone="#f97316" bg="#fff7ed" />
        <Kpi icon="◷" value={dashboard?.active_loans ?? "—"} label="Prêts actifs" bad tone="#ef4444" bg="#fff1f2" />
      </div>
      <div className="actor-grid">
        <Panel title="Prochaines réunions">
          <Table columns={["Titre", "Date", "Heure", "Lieu", "Action"]} rows={[
            ["Réunion mensuelle", "18/05/2024", "10:00", "Salle A", "Voir"],
            ["Réunion extraordinaire", "25/05/2024", "14:00", "Salle B", "Voir"],
            ["Réunion de clôture", "01/06/2024", "09:00", "Salle A", "Voir"],
          ]} />
        </Panel>
        <Panel title="Actions rapides">
          <div className="actor-actions">
            <button className="actor-action" style={{ "--tone": "#99f6e4", color: "#0f766e" }}>▣ Créer une réunion</button>
            <button className="actor-action" style={{ "--tone": "#bae6fd", color: "#075985" }}>♙ Faire l'appel</button>
            <button className="actor-action" style={{ "--tone": "#c4b5fd" }}>▤ Rédiger compte rendu</button>
            <button className="actor-action" style={{ "--tone": "#fdba74" }}>□ Générer rapport réunion</button>
          </div>
        </Panel>
      </div>
      <div className="actor-grid">
        <Panel title="Derniers comptes rendus">
          <Table columns={["Réunion", "Date", "Auteur", "Statut", "Action"]} rows={[
            ["Réunion mensuelle", "20/04/2024", "Secrétaire", <span className="actor-status">Validé</span>, "Voir"],
            ["Réunion extraordinaire", "26/04/2024", "Secrétaire", <span className="actor-status">Validé</span>, "Voir"],
            ["Réunion ordinaire", "15/04/2024", "Secrétaire", <span className="actor-status warn">En attente</span>, "Voir"],
          ]} />
        </Panel>
        <Panel title="Présence du mois"><Donut tone="#14b8a6" /></Panel>
      </div>
    </div>
  );
}

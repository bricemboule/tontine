import { ACTOR_DASHBOARD_CSS, EmptyState, Hero, Kpi, Panel, StatusPill, Table, fmtCFA, fmtDate } from "./components";

export function SecretaireHomeMock({ dashboard, meetings = [], members = [], onNav }) {
  const tone = "#7c3aed";
  const go = (id) => () => onNav?.(id);
  const lastMeetings = [...meetings].slice(0, 5);
  const lastMembers = [...members].slice(0, 5);

  return (
    <div className="actor-board">
      <style>{ACTOR_DASHBOARD_CSS}</style>
      <Hero title="Bonjour Secrétaire 👋" sub="Gestion des réunions et des membres" />
      <div className="actor-kpis k6">
        <Kpi icon="▣" value={dashboard?.upcoming_meetings ?? "—"} label="Réunions programmées" tone={tone} bg="#f5f3ff" />
        <Kpi icon="♣" value={dashboard?.members_count ?? "—"} label="Membres actifs" tone="#16a34a" bg="#ecfdf5" />
        <Kpi icon="♡" value={dashboard?.late_contributions ?? "—"} label="Cotisations en retard" bad tone="#ef4444" bg="#fff1f2" />
        <Kpi icon="▤" value={fmtCFA(dashboard?.collected_contributions)} label="Cotisations encaissées" tone={tone} bg="#f5f3ff" />
        <Kpi icon="□" value={dashboard?.unpaid_penalties ?? "—"} label="Pénalités impayées" tone="#f97316" bg="#fff7ed" />
        <Kpi icon="◷" value={dashboard?.active_loans ?? "—"} label="Prêts actifs" tone="#2563eb" bg="#eff6ff" />
      </div>
      <div className="actor-grid">
        <Panel title="Prochaines réunions">
          {lastMeetings.length === 0 ? (
            <EmptyState>Aucune réunion planifiée.</EmptyState>
          ) : (
            <Table
              columns={["Titre", "Date", "Heure", "Lieu", "Statut"]}
              rows={lastMeetings.map((m) => [
                m.title || "—",
                fmtDate(m.date),
                m.time || "—",
                m.location || "—",
                <StatusPill key={m.id} status={m.status} />,
              ])}
            />
          )}
        </Panel>
        <Panel title="Actions rapides">
          <div className="actor-actions">
            <button className="actor-action" style={{ "--tone": "#7c3aed" }} onClick={go("reunions/create")}>⬡ Créer une réunion</button>
            <button className="actor-action" style={{ "--tone": "#2563eb" }} onClick={go("membres/create")}>◉ Ajouter un membre</button>
            <button className="actor-action" style={{ "--tone": "#16a34a" }} onClick={go("cotisations/create")}>≡ Nouvelle cotisation</button>
            <button className="actor-action" style={{ "--tone": "#f97316" }} onClick={go("tours")}>↻ Tours</button>
          </div>
        </Panel>
      </div>
      <Panel title="Membres récents">
        {lastMembers.length === 0 ? (
          <EmptyState>Aucun membre pour le moment.</EmptyState>
        ) : (
          <Table
            columns={["Nom", "Rôle", "Téléphone", "Statut"]}
            rows={lastMembers.map((m) => [
              m.name,
              m.role,
              m.phone || "—",
              <StatusPill key={m.id} status={m.status} />,
            ])}
          />
        )}
      </Panel>
    </div>
  );
}

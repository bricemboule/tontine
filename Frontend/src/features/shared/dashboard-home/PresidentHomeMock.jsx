import { ACTOR_DASHBOARD_CSS, EmptyState, Hero, Kpi, Panel, StatusPill, Table, fmtCFA, fmtDate } from "./components";

export function PresidentHomeMock({ dashboard, members = [], loans = [], meetings = [], onNav }) {
  const tone = "#2563eb";
  const go = (id) => () => onNav?.(id);
  const pendingMembers = members.filter((m) => m.status === "pending");
  const pendingLoans = loans.filter((l) => ["pending", "en attente"].includes(String(l.status || "").toLowerCase()));
  const lastMeetings = [...meetings].slice(0, 5);

  return (
    <div className="actor-board">
      <style>{ACTOR_DASHBOARD_CSS}</style>
      <Hero title="Bonjour Président 👋" sub="Vue de pilotage et de validation" />
      <div className="actor-kpis k6">
        <Kpi icon="▣" value={fmtCFA(dashboard?.cash_balance)} label="Solde caisse" tone={tone} bg="#eff6ff" />
        <Kpi icon="♣" value={dashboard?.members_count ?? "—"} label="Membres actifs" tone={tone} bg="#eff6ff" />
        <Kpi icon="%" value={dashboard?.late_contributions ?? "—"} label="Cotisations en retard" bad tone="#ef4444" bg="#fff1f2" />
        <Kpi icon="●" value={pendingMembers.length} label="Membres à valider" tone="#f97316" bg="#fff7ed" />
        <Kpi icon="▥" value={dashboard?.active_loans ?? "—"} label="Prêts actifs" tone={tone} bg="#eff6ff" />
        <Kpi icon="□" value={dashboard?.upcoming_meetings ?? "—"} label="Réunions à venir" tone="#7c3aed" bg="#f5f3ff" />
      </div>
      <div className="actor-grid">
        <Panel title="Membres à valider">
          {pendingMembers.length === 0 ? (
            <EmptyState>Aucun membre en attente de validation.</EmptyState>
          ) : (
            <Table
              columns={["Nom", "Rôle", "Téléphone", "Statut"]}
              rows={pendingMembers.slice(0, 6).map((m) => [
                m.name,
                m.role,
                m.phone || "—",
                <StatusPill key={m.id} status={m.status} />,
              ])}
            />
          )}
        </Panel>
        <Panel title="Actions rapides">
          <div className="actor-actions">
            <button className="actor-action" style={{ "--tone": "#2563eb" }} onClick={go("membres")}>◉ Valider des membres</button>
            <button className="actor-action" style={{ "--tone": "#16a34a" }} onClick={go("prets")}>◎ Traiter les prêts</button>
            <button className="actor-action" style={{ "--tone": "#7c3aed" }} onClick={go("reunions")}>⬡ Réunions</button>
            <button className="actor-action" style={{ "--tone": "#f97316" }} onClick={go("cotisations")}>≡ Cotisations</button>
          </div>
        </Panel>
      </div>
      <div className="actor-grid equal">
        <Panel title="Prêts à approuver">
          {pendingLoans.length === 0 ? (
            <EmptyState>Aucun prêt en attente.</EmptyState>
          ) : (
            <Table
              columns={["Demandeur", "Montant", "Statut"]}
              rows={pendingLoans.slice(0, 5).map((l) => [
                l.name || "—",
                fmtCFA(l.amount),
                <StatusPill key={l.id} status={l.status} />,
              ])}
            />
          )}
        </Panel>
        <Panel title="Prochaines réunions">
          {lastMeetings.length === 0 ? (
            <EmptyState>Aucune réunion planifiée.</EmptyState>
          ) : (
            <Table
              columns={["Titre", "Date", "Lieu"]}
              rows={lastMeetings.map((m) => [
                m.title || "—",
                fmtDate(m.date),
                m.location || "—",
              ])}
            />
          )}
        </Panel>
      </div>
    </div>
  );
}

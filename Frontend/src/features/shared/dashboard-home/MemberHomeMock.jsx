import { ACTOR_DASHBOARD_CSS, EmptyState, Hero, Kpi, Panel, StatusPill, Table, fmtCFA, fmtDate } from "./components";

export function MemberHomeMock({ user, dashboard, cotisations = [], meetings = [], notifications = [], receipts = [] }) {
  const firstName = (user?.name || "").split(" ")[0] || "";
  const lastCotisations = [...cotisations].slice(0, 5);
  const lastMeetings = [...meetings].slice(0, 4);
  const lastNotifs = [...notifications].slice(0, 5);
  const lastReceipts = [...receipts].slice(0, 4);

  return (
    <div className="actor-board">
      <style>{ACTOR_DASHBOARD_CSS}</style>
      <Hero title={`Bonjour${firstName ? `, ${firstName}` : ""} 👋`} sub="Voici votre espace personnel" />
      <div className="actor-kpis k6">
        <Kpi icon="▣" value={fmtCFA(dashboard?.total_contributed)} label="Total cotisé" tone="#0891b2" bg="#ecfeff" />
        <Kpi icon="▣" value={fmtCFA(dashboard?.remaining_contributions)} label="Montant restant" tone="#14b8a6" bg="#ecfdf5" />
        <Kpi icon="!" value={fmtCFA(dashboard?.penalties)} label="Pénalités" bad tone="#ef4444" bg="#fff1f2" />
        <Kpi icon="□" value={dashboard?.next_payment ? fmtDate(dashboard.next_payment) : "—"} label="Prochain paiement" tone="#0891b2" bg="#ecfeff" />
        <Kpi icon="◷" value={dashboard?.payout_turn ?? "—"} label="Mon tour de passage" tone="#7c3aed" bg="#f5f3ff" />
        <Kpi icon="▣" value={dashboard?.active_loans ?? "—"} label="Prêts actifs" tone="#d946ef" bg="#fdf4ff" />
      </div>
      <div className="actor-grid">
        <Panel title="Mes dernières cotisations">
          {lastCotisations.length === 0 ? (
            <EmptyState>Aucune cotisation pour le moment.</EmptyState>
          ) : (
            <Table
              columns={["Cotisation", "Montant", "Statut"]}
              rows={lastCotisations.map((c) => [
                c.label || "—",
                fmtCFA(c.amount),
                <StatusPill key={c.id} status={c.status} />,
              ])}
            />
          )}
        </Panel>
        <Panel title="Notifications récentes">
          {lastNotifs.length === 0 ? (
            <EmptyState>Aucune notification.</EmptyState>
          ) : (
            <div className="actor-list">
              {lastNotifs.map((n) => (
                <div className="actor-line" key={n.id}>
                  <div className="actor-line-main">{n.title || n.body || "—"}</div>
                  <div className="actor-line-sub">{fmtDate(n.date)}</div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
      <div className="actor-grid equal">
        <Panel title="Prochaines réunions">
          {lastMeetings.length === 0 ? (
            <EmptyState>Aucune réunion planifiée.</EmptyState>
          ) : (
            <div className="actor-list">
              {lastMeetings.map((m) => (
                <div className="actor-line" key={m.id}>
                  <div className="actor-line-main">{m.title || "Réunion"}</div>
                  <div className="actor-line-sub">{fmtDate(m.date)}{m.time ? ` · ${m.time}` : ""}{m.location ? ` · ${m.location}` : ""}</div>
                </div>
              ))}
            </div>
          )}
        </Panel>
        <Panel title="Mes reçus récents">
          {lastReceipts.length === 0 ? (
            <EmptyState>Aucun reçu disponible.</EmptyState>
          ) : (
            <div className="actor-list">
              {lastReceipts.map((r) => (
                <div className="actor-line" key={r.id}>
                  <div className="actor-line-main">Reçu {r.number || `#${r.id}`}</div>
                  <div className="actor-line-sub">{fmtDate(r.created_at)}{r.amount ? ` · ${fmtCFA(r.amount)}` : ""}</div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

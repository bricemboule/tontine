import { ACTOR_DASHBOARD_CSS, EmptyState, Hero, Kpi, Panel, StatusPill, Table, fmtCFA, fmtDate } from "./components";

export function TresorierHomeMock({ dashboard, payments = [], cotisations = [], onNav }) {
  const tone = "#f97316";
  const go = (id) => () => onNav?.(id);
  const lastPayments = [...payments].slice(0, 5);
  const lastCotisations = [...cotisations].slice(0, 5);

  return (
    <div className="actor-board">
      <style>{ACTOR_DASHBOARD_CSS}</style>
      <Hero title="Gestion financière 👋" sub="Trésorerie quotidienne" />
      <div className="actor-kpis k6">
        <Kpi icon="◷" value={fmtCFA(dashboard?.collected_contributions)} label="Total encaissé" tone={tone} bg="#fff7ed" />
        <Kpi icon="♙" value={fmtCFA(dashboard?.expected_contributions)} label="Total attendu" tone={tone} bg="#fff7ed" />
        <Kpi icon="%" value={dashboard?.late_contributions ?? "—"} label="En retard" bad tone="#ef4444" bg="#fff1f2" />
        <Kpi icon="▣" value={dashboard?.unpaid_penalties ?? "—"} label="Pénalités impayées" tone={tone} bg="#fff7ed" />
        <Kpi icon="□" value={dashboard?.active_loans ?? "—"} label="Prêts actifs" tone={tone} bg="#fff7ed" />
        <Kpi icon="✓" value={fmtCFA(dashboard?.cash_balance)} label="Solde disponible" tone="#16a34a" bg="#ecfdf5" />
      </div>
      <div className="actor-grid">
        <Panel title="Paiements récents">
          {lastPayments.length === 0 ? (
            <EmptyState>Aucun paiement enregistré.</EmptyState>
          ) : (
            <Table
              columns={["Membre", "Montant", "Méthode", "Date", "Statut"]}
              rows={lastPayments.map((p) => [
                p.name || "—",
                fmtCFA(p.amount),
                p.method || "—",
                fmtDate(p.date),
                <StatusPill key={p.id} status={p.status} />,
              ])}
            />
          )}
        </Panel>
        <Panel title="Actions rapides">
          <div className="actor-actions">
            <button className="actor-action" style={{ "--tone": "#7c3aed" }} onClick={go("paiements/create")}>▣ Enregistrer un paiement</button>
            <button className="actor-action" style={{ "--tone": "#2563eb" }} onClick={go("prets/create")}>◎ Nouveau prêt</button>
            <button className="actor-action" style={{ "--tone": "#f97316" }} onClick={go("penalties")}>⚖ Pénalités</button>
            <button className="actor-action" style={{ "--tone": "#16a34a" }} onClick={go("receipts")}>▧ Reçus</button>
          </div>
        </Panel>
      </div>
      <Panel title="Cotisations récentes">
        {lastCotisations.length === 0 ? (
          <EmptyState>Aucune cotisation pour le moment.</EmptyState>
        ) : (
          <Table
            columns={["Cotisation", "Montant", "Collecté", "Statut"]}
            rows={lastCotisations.map((c) => [
              c.label || "—",
              fmtCFA(c.amount),
              fmtCFA(c.montant_collecte),
              <StatusPill key={c.id} status={c.status} />,
            ])}
          />
        )}
      </Panel>
    </div>
  );
}

import { ACTOR_DASHBOARD_CSS, EmptyState, Hero, Kpi, Panel, StatusPill, Table, fmtCFA, fmtDate } from "./components";

export function AdminHomeMock({ dashboard, members = [], payments = [], onNav }) {
  const tone = "#16a34a";
  const go = (id) => () => onNav?.(id);
  const lastMembers = [...members].slice(0, 5);
  const lastPayments = [...payments].slice(0, 5);

  return (
    <div className="actor-board">
      <style>{ACTOR_DASHBOARD_CSS}</style>
      <Hero title="Bonjour, Administrateur 👋" sub="Vue d'ensemble de votre tontine" />
      <div className="actor-kpis k6">
        <Kpi icon="▥" value={dashboard?.upcoming_meetings ?? "—"} label="Réunions à venir" tone={tone} bg="#ecfdf5" />
        <Kpi icon="♣" value={dashboard?.members_count ?? "—"} label="Membres actifs" tone="#2563eb" bg="#eff6ff" />
        <Kpi icon="▣" value={fmtCFA(dashboard?.cash_balance)} label="Solde caisse" tone={tone} bg="#ecfdf5" />
        <Kpi icon="↗" value={fmtCFA(dashboard?.expected_contributions)} label="Cotisations attendues" tone={tone} bg="#ecfdf5" />
        <Kpi icon="✓" value={fmtCFA(dashboard?.collected_contributions)} label="Cotisations encaissées" tone={tone} bg="#ecfdf5" />
        <Kpi icon="◷" value={dashboard?.late_contributions ?? "—"} label="Cotisations en retard" bad tone="#f97316" bg="#fff7ed" />
      </div>
      <div className="actor-grid">
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
        <Panel title="Actions rapides">
          <div className="actor-actions">
            <button className="actor-action" style={{ "--tone": "#2563eb" }} onClick={go("membres/create")}>+ Ajouter un membre</button>
            <button className="actor-action" style={{ "--tone": "#7c3aed" }} onClick={go("paiements/create")}>▣ Enregistrer un paiement</button>
            <button className="actor-action" style={{ "--tone": "#16a34a" }} onClick={go("cotisations/create")}>+ Nouvelle cotisation</button>
            <button className="actor-action" style={{ "--tone": "#f97316" }} onClick={go("reports")}>▤ Générer un rapport</button>
          </div>
        </Panel>
      </div>
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
    </div>
  );
}

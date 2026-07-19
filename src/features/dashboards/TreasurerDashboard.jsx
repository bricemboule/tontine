import DashboardLayout from "@/layouts/DashboardLayout";
import DataTable from "@/components/dashboard/DataTable";
import Panel from "@/components/dashboard/Panel";
import QuickActionsPanel from "@/components/dashboard/QuickActionsPanel";
import RecentPaymentsTable from "@/components/dashboard/RecentPaymentsTable";
import StatCard from "@/components/dashboard/StatCard";
import { dashboardMockData, normalizeDashboardConfig } from "@/data/dashboardMockData";

const data = normalizeDashboardConfig(dashboardMockData.treasurer);

function QuickPaymentForm() {
  return (
    <div className="dash-form-grid">
      <label className="dash-field">
        <span>Membre</span>
        <select className="dash-input"><option>Sélectionner un membre</option></select>
      </label>
      <label className="dash-field">
        <span>Montant</span>
        <input className="dash-input" placeholder="0 FCFA" />
      </label>
      <label className="dash-field">
        <span>Méthode</span>
        <select className="dash-input"><option>Espèces</option><option>Mobile Money</option></select>
      </label>
      <label className="dash-field">
        <span>Référence</span>
        <input className="dash-input" placeholder="Référence paiement" />
      </label>
      <button className="dash-submit-btn" type="button">Enregistrer le paiement</button>
    </div>
  );
}

export default function TreasurerDashboardPage() {
  return (
    <DashboardLayout {...data}>
      <div className="dash-stats-grid">
        {data.stats.map(stat => <StatCard key={stat.label} {...stat} />)}
      </div>

      <div className="dash-content-grid">
        <Panel title="Enregistrement rapide">
          <QuickPaymentForm />
        </Panel>
        <Panel title="Paiements récents" action="Voir tous">
          <RecentPaymentsTable rows={data.recentPayments} />
        </Panel>
      </div>

      <div className="dash-content-grid is-even">
        <Panel title="Cotisations en retard" action="Voir toutes">
          <DataTable
            columns={["Membre", "Montant", "Retard"]}
            rows={data.lateContributions}
          />
        </Panel>
        <Panel title="Actions rapides">
          <QuickActionsPanel actions={data.actions} />
        </Panel>
      </div>
    </DashboardLayout>
  );
}

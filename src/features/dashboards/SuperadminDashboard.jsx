import DashboardLayout from "@/layouts/DashboardLayout";
import ActivityList from "@/components/dashboard/ActivityList";
import ChartCard from "@/components/dashboard/ChartCard";
import DataTable from "@/components/dashboard/DataTable";
import Panel from "@/components/dashboard/Panel";
import StatCard from "@/components/dashboard/StatCard";
import { dashboardMockData, normalizeDashboardConfig } from "@/data/dashboardMockData";

const data = normalizeDashboardConfig(dashboardMockData.superadmin);

export default function SuperadminDashboardPage() {
  return (
    <DashboardLayout {...data}>
      <div className="dash-stats-grid">
        {data.stats.map(stat => <StatCard key={stat.label} {...stat} />)}
      </div>

      <div className="dash-content-grid">
        <Panel title="Revenus SaaS - 12 derniers mois" action="Année en cours">
          <ChartCard color={data.theme.primary} />
        </Panel>
        <Panel title="Alertes système">
          <ActivityList items={data.alerts} alertMode />
        </Panel>
      </div>

      <div className="dash-content-grid is-even">
        <Panel title="Dernières organisations inscrites" action="Voir toutes">
          <DataTable
            columns={["Organisation", "Plan", "Date", "Statut"]}
            rows={data.organizations}
          />
        </Panel>
        <Panel title="Paiements récents" action="Voir tous">
          <DataTable
            columns={["Organisation", "Montant", "Date", "Statut"]}
            rows={data.payments}
          />
        </Panel>
      </div>
    </DashboardLayout>
  );
}

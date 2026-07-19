import DashboardLayout from "@/layouts/DashboardLayout";
import ActivityList from "@/components/dashboard/ActivityList";
import ChartCard from "@/components/dashboard/ChartCard";
import DataTable from "@/components/dashboard/DataTable";
import Panel from "@/components/dashboard/Panel";
import QuickActionsPanel from "@/components/dashboard/QuickActionsPanel";
import StatCard from "@/components/dashboard/StatCard";
import { dashboardMockData, normalizeDashboardConfig } from "@/data/dashboardMockData";

const data = normalizeDashboardConfig(dashboardMockData.admin);

export default function AdminDashboardPage() {
  return (
    <DashboardLayout {...data}>
      <div className="dash-stats-grid">
        {data.stats.map(stat => <StatCard key={stat.label} {...stat} />)}
      </div>

      <div className="dash-content-grid">
        <Panel title="Tontines actives" action="Voir toutes">
          <DataTable
            columns={["Tontine", "Membres", "Cotisation", "Fréquence", "Statut"]}
            rows={data.tontines}
          />
        </Panel>
        <Panel title="Actions rapides">
          <QuickActionsPanel actions={data.actions} />
        </Panel>
      </div>

      <div className="dash-content-grid">
        <Panel title="Activités récentes">
          <ActivityList items={data.activities} />
        </Panel>
        <Panel title="Répartition des cotisations">
          <ChartCard type="donut" color={data.theme.primary} />
        </Panel>
      </div>
    </DashboardLayout>
  );
}

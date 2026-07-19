import DashboardLayout from "@/layouts/DashboardLayout";
import ChartCard from "@/components/dashboard/ChartCard";
import DataTable from "@/components/dashboard/DataTable";
import Panel from "@/components/dashboard/Panel";
import QuickActionsPanel from "@/components/dashboard/QuickActionsPanel";
import StatCard from "@/components/dashboard/StatCard";
import { dashboardMockData, normalizeDashboardConfig } from "@/data/dashboardMockData";

const data = normalizeDashboardConfig(dashboardMockData.secretary);

export default function SecretaryDashboardPage() {
  return (
    <DashboardLayout {...data}>
      <div className="dash-stats-grid">
        {data.stats.map(stat => <StatCard key={stat.label} {...stat} />)}
      </div>

      <div className="dash-content-grid">
        <Panel title="Prochaines réunions" action="Voir toutes">
          <DataTable
            columns={["Titre", "Date", "Heure", "Lieu", "Action"]}
            rows={data.meetingsTable}
          />
        </Panel>
        <Panel title="Actions rapides">
          <QuickActionsPanel actions={data.actions} />
        </Panel>
      </div>

      <div className="dash-content-grid">
        <Panel title="Derniers comptes rendus" action="Voir toutes">
          <DataTable
            columns={["Réunion", "Date", "Auteur", "Statut", "Action"]}
            rows={data.reportsTable}
          />
        </Panel>
        <Panel title="Présence du mois">
          <ChartCard type="donut" color="#14b8a6" />
        </Panel>
      </div>
    </DashboardLayout>
  );
}

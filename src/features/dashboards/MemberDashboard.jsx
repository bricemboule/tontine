import DashboardLayout from "@/layouts/DashboardLayout";
import ActivityList from "@/components/dashboard/ActivityList";
import DataTable from "@/components/dashboard/DataTable";
import Panel from "@/components/dashboard/Panel";
import StatCard from "@/components/dashboard/StatCard";
import { dashboardMockData, normalizeDashboardConfig } from "@/data/dashboardMockData";

const data = normalizeDashboardConfig(dashboardMockData.member);

export default function MemberDashboardPage() {
  return (
    <DashboardLayout {...data}>
      <div className="dash-stats-grid">
        {data.stats.map(stat => <StatCard key={stat.label} {...stat} />)}
      </div>

      <div className="dash-content-grid">
        <Panel title="Mes dernières cotisations" action="Voir toutes">
          <DataTable
            columns={["Date", "Montant", "Statut", "Reçu"]}
            rows={data.contributions}
          />
        </Panel>
        <Panel title="Notifications récentes" action="Voir toutes">
          <ActivityList items={data.notifications} />
        </Panel>
      </div>

      <div className="dash-content-grid is-even">
        <Panel title="Prochaines réunions" action="Voir toutes">
          <ActivityList items={data.meetings} />
        </Panel>
        <Panel title="Mes reçus récents" action="Voir tous">
          <ActivityList items={data.receipts} />
        </Panel>
      </div>
    </DashboardLayout>
  );
}

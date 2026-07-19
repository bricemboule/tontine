import DashboardLayout from "@/layouts/DashboardLayout";
import ActivityList from "@/components/dashboard/ActivityList";
import DataTable from "@/components/dashboard/DataTable";
import FinancialSummaryCard from "@/components/dashboard/FinancialSummaryCard";
import Panel from "@/components/dashboard/Panel";
import StatCard from "@/components/dashboard/StatCard";
import { dashboardMockData, normalizeDashboardConfig } from "@/data/dashboardMockData";

const data = normalizeDashboardConfig(dashboardMockData.president);

export default function PresidentDashboardPage() {
  return (
    <DashboardLayout {...data}>
      <div className="dash-stats-grid">
        {data.stats.map(stat => <StatCard key={stat.label} {...stat} />)}
      </div>

      <div className="dash-content-grid">
        <Panel title="Demandes de validation" action="Voir toutes">
          <DataTable
            columns={["Type", "Montant", "Demandeur", "Date", "Action"]}
            rows={data.validations}
          />
        </Panel>
        <Panel title="Résumé financier">
          <FinancialSummaryCard items={data.summary} />
        </Panel>
      </div>

      <div className="dash-content-grid is-even">
        <Panel title="Activités sensibles">
          <ActivityList items={data.sensitive} alertMode />
        </Panel>
        <Panel title="Prochaines réunions">
          <ActivityList items={data.meetings} />
        </Panel>
      </div>
    </DashboardLayout>
  );
}

import SuperadminDashboardPage from "../features/dashboards/SuperadminDashboard";
import AdminDashboardPage from "../features/dashboards/AdminDashboard";
import PresidentDashboardPage from "../features/dashboards/PresidentDashboard";
import TreasurerDashboardPage from "../features/dashboards/TreasurerDashboard";
import SecretaryDashboardPage from "../features/dashboards/SecretaryDashboard";
import MemberDashboardPage from "../features/dashboards/MemberDashboard";

export const dashboardRoutes = [
  { path: "/superadmin/dashboard", roles: ["superadmin"], element: <SuperadminDashboardPage /> },
  { path: "/admin/dashboard", roles: ["admin"], element: <AdminDashboardPage /> },
  { path: "/president/dashboard", roles: ["president"], element: <PresidentDashboardPage /> },
  { path: "/treasurer/dashboard", roles: ["tresorier"], element: <TreasurerDashboardPage /> },
  { path: "/secretary/dashboard", roles: ["secretaire"], element: <SecretaryDashboardPage /> },
  { path: "/member/dashboard", roles: ["membre"], element: <MemberDashboardPage /> },
];

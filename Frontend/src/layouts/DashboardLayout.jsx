import Sidebar from "../components/dashboard/Sidebar";
import Header from "../components/dashboard/Header";
import "../components/dashboard/dashboard.css";

export default function DashboardLayout({ theme, menu, userName, title, subtitle, children }) {
  return (
    <div
      className="dashboard-shell"
      style={{
        "--dash-primary": theme.primary,
        "--dash-primary-2": theme.primary2,
        "--dash-primary-soft": theme.soft,
      }}
    >
      <div className="dashboard-grid">
        <Sidebar menu={menu} />
        <main className="dash-main">
          <Header userName={userName} />
          <div className="dash-page-head">
            <h1 className="dash-page-title">{title}</h1>
            <p className="dash-page-subtitle">{subtitle}</p>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

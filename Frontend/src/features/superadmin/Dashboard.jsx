import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApi }   from "@/hooks/useApi";
import { useToast } from "@/hooks/useToast";
import AdminLayout from "@/Layouts/AdminLayout";
import { AuditPage } from "../shared/index";
import { OrganizationsPage, SubscriptionsPage } from "../shared/SaaSMvp";
import { SuperadminHomeMock } from "../shared/ActorDashboardHomes";
import AdminsTab from "./components/AdminsTab";
import TontinesTab from "./components/TontinesTab";
import SettingsPage from "./pages/SettingsPage";
import { SUPERADMIN_NAV } from "./constants";

export default function SuperAdminDashboard() {
  const api               = useApi();
  const { toast, toasts } = useToast();
  const navigate          = useNavigate();
  const location          = useLocation();
  const [stats, setStats] = useState(null);
  const [tontines, setT]  = useState([]);
  const [admins, setAdmins] = useState([]);

  const path = location.pathname.replace("/superadmin/", "").replace("/superadmin", "").split("/")[0];
  const nav = path || "dashboard";
  const setNav = (id) => navigate(id === "dashboard" ? "/superadmin/dashboard" : `/superadmin/${id}`);

  useEffect(() => {
    api.getPlatformStats().then(setStats).catch(()=>{});
    api.getTontines().then(setT).catch(()=>{});
    api.getAdmins().then(setAdmins).catch(()=>{});
  }, []);

  const navItems = SUPERADMIN_NAV.map(n => ({
    ...n,
    badge: n.id==="tontines" ? tontines.filter(t=>t.status==="draft").length : n.id==="admins" ? admins.filter(a=>a.available).length : 0
  }));

  const pages = {
    dashboard: <SuperadminHomeMock stats={stats} />,
    organizations: <OrganizationsPage api={api} toast={toast} />,
    admins: <AdminsTab api={api} toast={toast} onAdminsChange={setAdmins} />,
    tontines: <TontinesTab api={api} toast={toast} onTontinesChange={setT} onOpenAdmins={() => setNav("admins")} />,
    subscriptions: <SubscriptionsPage api={api} />,
    audit:    <AuditPage api={api}/>,
    settings: <SettingsPage api={api} />,
  };

  return (
    <>
      <AdminLayout navItems={navItems} activeNav={pages[nav] ? nav : "dashboard"} onNav={setNav}
        pageTitle={SUPERADMIN_NAV.find(n=>n.id===nav)?.label||nav}>
        {pages[nav] || pages.dashboard}
      </AdminLayout>
      <div className="toast-wrap">{toasts.map(t=><div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>)}</div>
    </>
  );
}

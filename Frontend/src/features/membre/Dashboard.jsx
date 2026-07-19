import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useApi }  from "@/hooks/useApi";
import { useToast } from "@/hooks/useToast";
import AdminLayout from "@/Layouts/AdminLayout";
import { SHARED_CSS, Stat, fmtCFA } from "@/components/ui/index";
import { NotificationsPage, PaymentsPage, ToursPage } from "../shared/index";
import { PenaltiesPage, ReceiptsPage } from "../shared/SaaSMvp";
import { MemberHomeMock } from "../shared/ActorDashboardHomes";

import CotisationsIndex from "./cotisations/Index";
import CotisationsShow from "./cotisations/Show";
import PretsIndex from "./prets/Index";
import PretsShow from "./prets/Show";
import ReunionsIndex from "./reunions/Index";
import ReunionsShow from "./reunions/Show";

const NAV = [
  { id:"",           label:"Mon tableau de bord", icon:"◈" },
  { section:"Mon espace" },
  { id:"contributions", label:"Mes cotisations",   icon:"≡" },
  { id:"payments",      label:"Mes paiements",     icon:"◈" },
  { id:"turn",          label:"Mon tour",          icon:"↻" },
  { id:"penalties",     label:"Pénalités",         icon:"⚖" },
  { id:"loans",         label:"Mes prêts",         icon:"◎" },
  { id:"receipts",      label:"Reçus",             icon:"▧" },
  { id:"notifications", label:"Notifications",     icon:"◌" },
  { id:"meetings",      label:"Réunions",          icon:"⬡" },
];

const NAV_ALIASES = {
  dashboard: "",
  cotisations: "contributions",
  prets: "loans",
  reunions: "meetings",
};

function Home() {
  const { user } = useAuth();
  const api = useApi();
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    api.getMemberDashboard().then(setDashboard).catch(() => {});
  }, [api]);

  return <MemberHomeMock user={user} dashboard={dashboard} />;
}

export default function MembreDashboard() {
  const { user }   = useAuth();
  const api        = useApi();
  const { toast, toasts } = useToast();
  const navigate     = useNavigate();
  const location     = useLocation();
  const [members, setMembers] = useState([]);

  useEffect(() => { api.getMembers().then(setMembers).catch(() => {}); }, []);

  const pathParts = location.pathname.replace(/^\/(membre|member)\/?/, "").split("/");
  const activeNav = NAV_ALIASES[pathParts[0]] ?? pathParts[0] ?? "";
  const label     = NAV.find(n => n.id === activeNav)?.label || "Tableau de bord";

  return (
    <>
      <AdminLayout navItems={NAV} activeNav={activeNav}
        onNav={id => navigate(id ? `/member/${id}` : "/member")}
        pageTitle={label} tontineName={user?.tontine_name}>
        <Routes>
          <Route index element={<Home />} />
          <Route path="dashboard" element={<Home />} />
          <Route path="cotisations" element={<CotisationsIndex />} />
          <Route path="contributions" element={<CotisationsIndex />} />
          <Route path="cotisations/show/:id" element={<CotisationsShow />} />
          <Route path="contributions/show/:id" element={<CotisationsShow />} />
          <Route path="prets" element={<PretsIndex />} />
          <Route path="loans" element={<PretsIndex />} />
          <Route path="prets/show/:id" element={<PretsShow />} />
          <Route path="loans/show/:id" element={<PretsShow />} />
          <Route path="reunions" element={<ReunionsIndex />} />
          <Route path="meetings" element={<ReunionsIndex />} />
          <Route path="reunions/show/:id" element={<ReunionsShow />} />
          <Route path="meetings/show/:id" element={<ReunionsShow />} />
          <Route path="payments" element={<PaymentsPage api={api} toast={toast} members={members} />} />
          <Route path="turn" element={<ToursPage api={api} toast={toast} members={members} />} />
          <Route path="penalties" element={<PenaltiesPage api={api} />} />
          <Route path="receipts" element={<ReceiptsPage api={api} />} />
          <Route path="notifications" element={<NotificationsPage api={api} />} />
        </Routes>
      </AdminLayout>
      <div className="toast-wrap">{toasts.map(t => <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>)}</div>
    </>
  );
}

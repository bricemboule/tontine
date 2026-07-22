import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useApi }  from "@/hooks/useApi";
import { useToast } from "@/hooks/useToast";
import AdminLayout from "@/Layouts/AdminLayout";
import { SHARED_CSS, Stat, fmtCFA } from "@/components/ui/index";
import { SecretaireHomeMock } from "../shared/ActorDashboardHomes";

import MembresIndex from "./membres/Index";
import MembresCreate from "./membres/Create";
import MembresShow from "./membres/Show";
import MembresEdit from "./membres/Edit";
import CotisationsIndex from "./cotisations/Index";
import CotisationsCreate from "./cotisations/Create";
import CotisationsShow from "./cotisations/Show";
import CotisationsEdit from "./cotisations/Edit";
import SanctionsIndex from "./sanctions/Index";
import SanctionsShow from "./sanctions/Show";
import ReunionsIndex from "./reunions/Index";
import ReunionsCreate from "./reunions/Create";
import ReunionsShow from "./reunions/Show";
import ReunionsEdit from "./reunions/Edit";
import ReunionsClose from "./reunions/Close";
import ToursIndex from "./tours/Index";
import ToursShow from "./tours/Show";

const NAV = [
  { id:"",           label:"Tableau de bord", icon:"◈" },
  { section:"Gestion" },
  { id:"membres",    label:"Membres",          icon:"◉" },
  { id:"cotisations",label:"Cotisations",      icon:"≡" },
  { id:"sanctions",  label:"Sanctions",        icon:"⚖" },
  { id:"reunions",   label:"Réunions",         icon:"⬡" },
  { id:"tours",      label:"Tours",            icon:"↻" },
];

const asArray = (setter) => (d) => setter(Array.isArray(d) ? d : []);

function Home() {
  const api = useApi();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    api.getAdminDashboard().then(setDashboard).catch(() => {});
    api.getMeetings().then(asArray(setMeetings)).catch(() => {});
    api.getMembers().then(asArray(setMembers)).catch(() => {});
  }, [api]);

  return (
    <SecretaireHomeMock
      dashboard={dashboard}
      meetings={meetings}
      members={members}
      onNav={(id) => navigate(id ? `/secretaire/${id}` : "/secretaire")}
    />
  );
}

export default function SecretaireDashboard() {
  const { user }   = useAuth();
  const { toasts } = useToast();
  const navigate     = useNavigate();
  const location     = useLocation();

  const pathParts = location.pathname.replace("/secretaire/", "").replace("/secretaire", "").split("/");
  const activeNav = pathParts[0] || "";
  const label     = NAV.find(n => n.id === activeNav)?.label || "Tableau de bord";

  return (
    <>
      <AdminLayout navItems={NAV} activeNav={activeNav}
        onNav={id => navigate(id ? `/secretaire/${id}` : "/secretaire")}
        pageTitle={label} tontineName={user?.tontine_name}>
        <Routes>
          <Route index element={<Home />} />
          <Route path="dashboard" element={<Home />} />
          <Route path="membres" element={<MembresIndex />} />
          <Route path="membres/create" element={<MembresCreate />} />
          <Route path="membres/show/:id" element={<MembresShow />} />
          <Route path="membres/edit/:id" element={<MembresEdit />} />
          <Route path="cotisations" element={<CotisationsIndex />} />
          <Route path="cotisations/create" element={<CotisationsCreate />} />
          <Route path="cotisations/show/:id" element={<CotisationsShow />} />
          <Route path="cotisations/edit/:id" element={<CotisationsEdit />} />
          <Route path="sanctions" element={<SanctionsIndex />} />
          <Route path="sanctions/show/:id" element={<SanctionsShow />} />
          <Route path="reunions" element={<ReunionsIndex />} />
          <Route path="reunions/create" element={<ReunionsCreate />} />
          <Route path="reunions/show/:id" element={<ReunionsShow />} />
          <Route path="reunions/edit/:id" element={<ReunionsEdit />} />
          <Route path="reunions/close/:id" element={<ReunionsClose />} />
          <Route path="tours" element={<ToursIndex />} />
          <Route path="tours/show/:id" element={<ToursShow />} />
        </Routes>
      </AdminLayout>
      <div className="toast-wrap">{toasts.map(t => <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>)}</div>
    </>
  );
}

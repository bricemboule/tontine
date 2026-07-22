import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useApi }  from "@/hooks/useApi";
import { useToast } from "@/hooks/useToast";
import AdminLayout from "@/Layouts/AdminLayout";
import { SHARED_CSS, Stat, fmtCFA } from "@/components/ui/index";
import { PresidentHomeMock } from "../shared/ActorDashboardHomes";

import MembresIndex from "./membres/Index";
import MembresShow from "./membres/Show";
import MembresValidate from "./membres/Validate";
import MembresReject from "./membres/Reject";
import MembresSuspend from "./membres/Suspend";
import MembresEdit from "./membres/Edit";
import CotisationsIndex from "./cotisations/Index";
import CotisationsShow from "./cotisations/Show";
import PretsIndex from "./prets/Index";
import PretsShow from "./prets/Show";
import SanctionsIndex from "./sanctions/Index";
import SanctionsShow from "./sanctions/Show";
import ReunionsIndex from "./reunions/Index";
import ReunionsShow from "./reunions/Show";
import ReunionsCreate from "./reunions/Create";
import ReunionsEdit from "./reunions/Edit";
import ReunionsClose from "./reunions/Close";

const NAV = [
  { id:"",           label:"Tableau de bord", icon:"◈" },
  { section:"Gestion" },
  { id:"membres",    label:"Membres",          icon:"◉" },
  { id:"cotisations",label:"Cotisations",      icon:"≡" },
  { id:"prets",      label:"Prêts",            icon:"◎" },
  { id:"sanctions",  label:"Sanctions",        icon:"⚖" },
  { id:"reunions",   label:"Réunions",         icon:"⬡" },
];

const asArray = (setter) => (d) => setter(Array.isArray(d) ? d : []);

function Home() {
  const api = useApi();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [members, setMembers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    api.getAdminDashboard().then(setDashboard).catch(() => {});
    api.getMembers().then(asArray(setMembers)).catch(() => {});
    api.getLoans().then(asArray(setLoans)).catch(() => {});
    api.getMeetings().then(asArray(setMeetings)).catch(() => {});
  }, [api]);

  return (
    <PresidentHomeMock
      dashboard={dashboard}
      members={members}
      loans={loans}
      meetings={meetings}
      onNav={(id) => navigate(id ? `/president/${id}` : "/president")}
    />
  );
}

export default function PresidentDashboard() {
  const { user }   = useAuth();
  const { toasts } = useToast();
  const navigate     = useNavigate();
  const location     = useLocation();

  const pathParts = location.pathname.replace("/president/", "").replace("/president", "").split("/");
  const activeNav = pathParts[0] || "";
  const label     = NAV.find(n => n.id === activeNav)?.label || "Tableau de bord";

  return (
    <>
      <AdminLayout navItems={NAV} activeNav={activeNav}
        onNav={id => navigate(id ? `/president/${id}` : "/president")}
        pageTitle={label} tontineName={user?.tontine_name}>
        <Routes>
          <Route index element={<Home />} />
          <Route path="dashboard" element={<Home />} />
          <Route path="membres" element={<MembresIndex />} />
          <Route path="membres/show/:id" element={<MembresShow />} />
          <Route path="membres/validate/:id" element={<MembresValidate />} />
          <Route path="membres/reject/:id" element={<MembresReject />} />
          <Route path="membres/suspend/:id" element={<MembresSuspend />} />
          <Route path="membres/edit/:id" element={<MembresEdit />} />
          <Route path="cotisations" element={<CotisationsIndex />} />
          <Route path="cotisations/show/:id" element={<CotisationsShow />} />
          <Route path="prets" element={<PretsIndex />} />
          <Route path="prets/show/:id" element={<PretsShow />} />
          <Route path="sanctions" element={<SanctionsIndex />} />
          <Route path="sanctions/show/:id" element={<SanctionsShow />} />
          <Route path="reunions" element={<ReunionsIndex />} />
          <Route path="reunions/show/:id" element={<ReunionsShow />} />
          <Route path="reunions/create" element={<ReunionsCreate />} />
          <Route path="reunions/edit/:id" element={<ReunionsEdit />} />
          <Route path="reunions/close/:id" element={<ReunionsClose />} />
        </Routes>
      </AdminLayout>
      <div className="toast-wrap">{toasts.map(t => <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>)}</div>
    </>
  );
}

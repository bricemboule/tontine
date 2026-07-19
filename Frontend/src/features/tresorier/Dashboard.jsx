import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useApi }  from "@/hooks/useApi";
import { useToast } from "@/hooks/useToast";
import AdminLayout from "@/Layouts/AdminLayout";
import { SHARED_CSS, Stat, fmtCFA } from "@/components/ui/index";
import { CashPage, PenaltiesPage, ReceiptsPage } from "../shared/SaaSMvp";
import { TresorierHomeMock } from "../shared/ActorDashboardHomes";

import PaiementsIndex from "./paiements/Index";
import PaiementsCreate from "./paiements/Create";
import PaiementsShow from "./paiements/Show";
import PretsIndex from "./prets/Index";
import PretsCreate from "./prets/Create";
import PretsShow from "./prets/Show";
import CotisationsIndex from "./cotisations/Index";
import CotisationsShow from "./cotisations/Show";

const NAV = [
  { id:"",          label:"Tableau de bord", icon:"◈" },
  { section:"Finance" },
  { id:"paiements", label:"Paiements",        icon:"◈" },
  { id:"prets",     label:"Prêts",            icon:"◎" },
  { id:"cotisations",label:"Cotisations",     icon:"≡" },
  { id:"cash",      label:"Caisse",           icon:"▣" },
  { id:"penalties", label:"Pénalités",        icon:"⚖" },
  { id:"receipts",  label:"Reçus",            icon:"▧" },
];

function Home() {
  const api = useApi();
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    api.getAdminDashboard().then(setDashboard).catch(() => {});
  }, [api]);

  return <TresorierHomeMock dashboard={dashboard} />;
}

export default function TresorierDashboard() {
  const { user }   = useAuth();
  const api        = useApi();
  const { toast, toasts } = useToast();
  const navigate     = useNavigate();
  const location     = useLocation();

  const pathParts = location.pathname.replace("/tresorier/", "").replace("/tresorier", "").split("/");
  const activeNav = pathParts[0] || "";
  const label     = NAV.find(n => n.id === activeNav)?.label || "Tableau de bord";

  return (
    <>
      <AdminLayout navItems={NAV} activeNav={activeNav}
        onNav={id => navigate(id ? `/tresorier/${id}` : "/tresorier")}
        pageTitle={label} tontineName={user?.tontine_name}>
        <Routes>
          <Route index element={<Home />} />
          <Route path="dashboard" element={<Home />} />
          <Route path="paiements" element={<PaiementsIndex />} />
          <Route path="paiements/create" element={<PaiementsCreate />} />
          <Route path="paiements/show/:id" element={<PaiementsShow />} />
          <Route path="prets" element={<PretsIndex />} />
          <Route path="prets/create" element={<PretsCreate />} />
          <Route path="prets/show/:id" element={<PretsShow />} />
          <Route path="cotisations" element={<CotisationsIndex />} />
          <Route path="cotisations/show/:id" element={<CotisationsShow />} />
          <Route path="cash" element={<CashPage api={api} />} />
          <Route path="penalties" element={<PenaltiesPage api={api} toast={toast} canPay />} />
          <Route path="receipts" element={<ReceiptsPage api={api} />} />
        </Routes>
      </AdminLayout>
      <div className="toast-wrap">{toasts.map(t => <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>)}</div>
    </>
  );
}

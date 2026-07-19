import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useApi }  from "@/hooks/useApi";
import { useToast } from "@/hooks/useToast";
import AdminLayout from "@/Layouts/AdminLayout";
import { SHARED_CSS, Stat, Av, Prg, CashflowChart, Badge, fmtCFA, fmtDate } from "@/components/ui/index";
import { ReportsPage, NotificationsPage, ConfigPage } from "../shared/index";
import { CashPage, PenaltiesPage, ReceiptsPage, TontineOverviewPage } from "../shared/SaaSMvp";
import { AdminHomeMock } from "../shared/ActorDashboardHomes";

// ── Imports des vues par module ────────────────────────────────
import MembresIndex   from "./membres/Index";
import MembreCreate   from "./membres/Create";
import MembreShow     from "./membres/Show";
import MembreEdit     from "./membres/Edit";
import MembreValidate from "./membres/Validate";
import MembreReject   from "./membres/Reject";
import MembreSuspend  from "./membres/Suspend";

import CotisationsIndex from "./cotisations/Index";
import CotisationCreate from "./cotisations/Create";
import CotisationShow   from "./cotisations/Show";
import CotisationEdit   from "./cotisations/Edit";

import PretsIndex  from "./prets/Index";
import PretCreate  from "./prets/Create";
import PretShow    from "./prets/Show";

import SanctionsIndex from "./sanctions/Index";
import SanctionCreate from "./sanctions/Create";
import SanctionShow   from "./sanctions/Show";

import PaiementsIndex from "./paiements/Index";
import PaiementCreate from "./paiements/Create";
import PaiementShow   from "./paiements/Show";

import ReunionsIndex from "./reunions/Index";
import ReunionCreate from "./reunions/Create";
import ReunionShow   from "./reunions/Show";
import ReunionEdit   from "./reunions/Edit";
import ReunionClose  from "./reunions/Close";

import ToursIndex from "./tours/Index";
import TourShow   from "./tours/Show";

// ── Navigation sidebar ─────────────────────────────────────────
const NAV = [
  { id:"",           label:"Tableau de bord", icon:"◈" },
  { section:"Gestion" },
  { id:"tontines",   label:"Tontine",          icon:"⬡" },
  { id:"membres",    label:"Membres",          icon:"◉" },
  { id:"cotisations",label:"Cotisations",      icon:"≡" },
  { id:"prets",      label:"Prêts",            icon:"◎" },
  { id:"paiements",  label:"Paiements",        icon:"◈" },
  { id:"cash",       label:"Caisse",           icon:"▣" },
  { id:"reunions",   label:"Réunions",         icon:"⬡" },
  { id:"sanctions",  label:"Sanctions",        icon:"⚖" },
  { id:"tours",      label:"Tours",            icon:"↻" },
  { section:"Pilotage" },
  { id:"reports",    label:"Rapports",         icon:"▤" },
  { id:"receipts",   label:"Reçus",            icon:"▧" },
  { id:"notifications", label:"Notifications", icon:"◌" },
  { id:"settings",   label:"Paramètres",       icon:"⚙" },
];

const NAV_ALIASES = {
  dashboard: "",
  members: "membres",
  contributions: "cotisations",
  payments: "paiements",
  "payout-turns": "tours",
  penalties: "sanctions",
  loans: "prets",
  meetings: "reunions",
};

function AdminHome() {
  const api = useApi();
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    api.getAdminDashboard().then(setDashboard).catch(() => {});
  }, [api]);

  return <AdminHomeMock dashboard={dashboard} />;
}

export default function AdminDashboard() {
  const { user }          = useAuth();
  const api               = useApi();
  const { toast, toasts } = useToast();
  const navigate          = useNavigate();
  const location          = useLocation();

  // Déduire l'onglet actif depuis l'URL
  const pathParts = location.pathname.replace("/admin/", "").replace("/admin", "").split("/");
  const activeNav = NAV_ALIASES[pathParts[0]] ?? pathParts[0] ?? "";

  const [members, setMembers] = useState([]);
  useEffect(() => { api.getMembers().then(setMembers).catch(() => {}); }, []);

  const pending  = members.filter(m => m.status === "pending").length;
  const navItems = NAV.map(n => n.section ? n : {
    ...n,
    badge: n.id === "membres"    ? pending : 0,
  });

  const label = NAV.find(n => n.id === activeNav)?.label || "Tableau de bord";

  return (
    <>
      <AdminLayout navItems={navItems} activeNav={activeNav}
        onNav={id => navigate(id ? `/admin/${id}` : "/admin")}
        pageTitle={label} tontineName={user?.tontine_name}>
        <Routes>
          <Route index element={<AdminHome />} />
          <Route path="dashboard" element={<AdminHome />} />

          {/* Tontine courante */}
          <Route path="tontines" element={<TontineOverviewPage api={api} />} />
          <Route path="tontines/create" element={<TontineOverviewPage api={api} />} />
          <Route path="tontines/:id" element={<TontineOverviewPage api={api} />} />

          {/* Membres */}
          <Route path="membres"              element={<MembresIndex />} />
          <Route path="membres/create"       element={<MembreCreate />} />
          <Route path="membres/show/:id"     element={<MembreShow />} />
          <Route path="membres/edit/:id"     element={<MembreEdit />} />
          <Route path="membres/validate/:id" element={<MembreValidate />} />
          <Route path="membres/reject/:id"   element={<MembreReject />} />
          <Route path="membres/suspend/:id"  element={<MembreSuspend />} />
          <Route path="members"              element={<MembresIndex />} />

          {/* Cotisations */}
          <Route path="cotisations"           element={<CotisationsIndex />} />
          <Route path="cotisations/create"    element={<CotisationCreate />} />
          <Route path="cotisations/show/:id"  element={<CotisationShow />} />
          <Route path="cotisations/edit/:id"  element={<CotisationEdit />} />
          <Route path="contributions"         element={<CotisationsIndex />} />

          {/* Prêts */}
          <Route path="prets"           element={<PretsIndex />} />
          <Route path="prets/create"    element={<PretCreate />} />
          <Route path="prets/show/:id"  element={<PretShow />} />
          <Route path="loans"           element={<PretsIndex />} />

          {/* Paiements */}
          <Route path="paiements"          element={<PaiementsIndex />} />
          <Route path="paiements/create"   element={<PaiementCreate />} />
          <Route path="paiements/show/:id" element={<PaiementShow />} />
          <Route path="payments"           element={<PaiementsIndex />} />
          <Route path="cash"               element={<CashPage api={api} />} />

          {/* Réunions */}
          <Route path="reunions"           element={<ReunionsIndex />} />
          <Route path="reunions/create"    element={<ReunionCreate />} />
          <Route path="reunions/show/:id"  element={<ReunionShow />} />
          <Route path="reunions/edit/:id"  element={<ReunionEdit />} />
          <Route path="reunions/close/:id" element={<ReunionClose />} />
          <Route path="meetings"           element={<ReunionsIndex />} />

          {/* Sanctions */}
          <Route path="sanctions"          element={<SanctionsIndex />} />
          <Route path="sanctions/create"   element={<SanctionCreate />} />
          <Route path="sanctions/show/:id" element={<SanctionShow />} />
          <Route path="penalties"          element={<PenaltiesPage api={api} toast={toast} canPay />} />

          {/* Tours */}
          <Route path="tours"          element={<ToursIndex />} />
          <Route path="tours/show/:id" element={<TourShow />} />
          <Route path="payout-turns"   element={<ToursIndex />} />

          {/* Pilotage */}
          <Route path="reports"       element={<ReportsPage api={api} toast={toast} members={members} />} />
          <Route path="receipts"      element={<ReceiptsPage api={api} />} />
          <Route path="notifications" element={<NotificationsPage api={api} />} />
          <Route path="settings"      element={<ConfigPage api={api} toast={toast} />} />
        </Routes>
      </AdminLayout>
      <div className="toast-wrap">{toasts.map(t => <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>)}</div>
    </>
  );
}

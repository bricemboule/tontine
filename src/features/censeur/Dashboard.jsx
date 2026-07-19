import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useApi }  from "@/hooks/useApi";
import { useToast } from "@/hooks/useToast";
import { Scale, Clock, UserX } from "lucide-react";
import AdminLayout from "@/Layouts/AdminLayout";
import { StatCard } from "@/design-system";

import MembresIndex from "./membres/Index";
import MembresShow from "./membres/Show";
import SanctionsIndex from "./sanctions/Index";
import SanctionsCreate from "./sanctions/Create";
import SanctionsShow from "./sanctions/Show";

const NAV = [
  { id:"",          label:"Tableau de bord", icon:"◈" },
  { section:"Contrôle" },
  { id:"sanctions", label:"Sanctions",        icon:"⚖" },
  { id:"membres",   label:"Membres",          icon:"◉" },
];

function Home() {
  const api = useApi();
  const [members, setMembers]     = useState([]);
  const [payments, setPayments]   = useState([]);
  const [loans, setLoans]         = useState([]);
  const [sanctions, setSanctions] = useState([]);

  useEffect(() => {
    api.getMembers().then(setMembers).catch(() => {});
    api.getPayments?.()?.then(setPayments)?.catch(() => {});
    api.getLoans?.()?.then(setLoans)?.catch(() => {});
    api.getSanctions?.()?.then(setSanctions)?.catch(() => {});
  }, []);

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard label="Sanctions actives" value={sanctions.filter(s => s.status === "active").length} icon={Scale} />
      <StatCard label="En attente président" value={sanctions.filter(s => s.status === "pending_president").length} icon={Clock} />
      <StatCard label="Membres suspendus" value={members.filter(m => m.status === "suspended").length} icon={UserX} />
    </div>
  );
}

export default function CenseurDashboard() {
  const { user }   = useAuth();
  const { toasts } = useToast();
  const navigate     = useNavigate();
  const location     = useLocation();

  const pathParts = location.pathname.replace("/censeur/", "").replace("/censeur", "").split("/");
  const activeNav = pathParts[0] || "";
  const label     = NAV.find(n => n.id === activeNav)?.label || "Tableau de bord";

  return (
    <>
      <AdminLayout navItems={NAV} activeNav={activeNav}
        onNav={id => navigate(id ? `/censeur/${id}` : "/censeur")}
        pageTitle={label} tontineName={user?.tontine_name}>
        <Routes>
          <Route index element={<Home />} />
          <Route path="membres" element={<MembresIndex />} />
          <Route path="membres/show/:id" element={<MembresShow />} />
          <Route path="sanctions" element={<SanctionsIndex />} />
          <Route path="sanctions/create" element={<SanctionsCreate />} />
          <Route path="sanctions/show/:id" element={<SanctionsShow />} />
        </Routes>
      </AdminLayout>
      <div className="toast-wrap">{toasts.map(t => <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>)}</div>
    </>
  );
}

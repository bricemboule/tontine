import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Check, X, Users } from "lucide-react";
import { Av, fmtDate } from "@/components/ui/index";
import { useApi } from "@/hooks/useApi";
import { useToast } from "@/hooks/useToast";
import { PageHeader, Tabs, DataTable, Badge, StatusBadge, Button } from "@/design-system";

const ROLE_LABELS = {
  admin: "Administrateur", president: "Président", secretaire: "Secrétaire",
  tresorier: "Trésorier", censeur: "Censeur", membre: "Membre",
};

function Progress({ value, max }) {
  const pct = Math.min(100, Math.round((value / Math.max(max, 1)) * 100));
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
      <div className="h-full rounded-full bg-primary-500" style={{ width: `${pct}%` }} />
    </div>
  );
}

/* Liste des membres — écran unique partagé.
   caps.create : bouton d'ajout · caps.moderate : actions valider/rejeter/suspendre/réactiver */
export default function MembersIndex({ caps = {} }) {
  const api = useApi();
  const { toast, toasts } = useToast();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");

  useEffect(() => {
    api.getMembers()
      .then((d) => setMembers(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [api]);

  const doReactivate = async (id) => {
    try {
      const m = await api.reactivateMember(id);
      setMembers((p) => p.map((x) => (x.id === id ? m : x)));
      toast("Membre réactivé ✓");
    } catch (e) { toast(e.message, "error"); }
  };

  const tabs = [
    { id: "all", label: "Tous", count: members.length },
    { id: "active", label: "Actifs", count: members.filter((m) => m.status === "active").length },
    { id: "pending", label: "En attente", count: members.filter((m) => m.status === "pending").length },
    { id: "suspended", label: "Suspendus", count: members.filter((m) => m.status === "suspended").length },
  ];
  const list = tab === "all" ? members : members.filter((m) => m.status === tab);

  const columns = [
    {
      key: "name", header: "Membre", width: "30%", sortable: true,
      render: (m) => (
        <div className="flex items-center gap-2.5">
          <Av name={m.name} id={m.id} />
          <div>
            <div className="font-semibold text-ink">{m.name}</div>
            <div className="text-[11px] text-ink-subtle">Depuis {fmtDate(m.joined)}</div>
          </div>
        </div>
      ),
    },
    {
      key: "phone", header: "Contact",
      render: (m) => (
        <div>
          <div className="text-[13px] font-medium text-ink">{m.phone}</div>
          {m.email && <div className="text-[11px] text-ink-subtle">{m.email}</div>}
        </div>
      ),
    },
    {
      key: "role", header: "Rôle",
      render: (m) => (
        <div className="flex flex-col items-start gap-1.5">
          <Badge variant="neutral">{ROLE_LABELS[m.role] || m.role}</Badge>
          <StatusBadge status={m.status} />
        </div>
      ),
    },
    {
      key: "cotisations", header: "Cotisations", width: "160px",
      render: (m) => (
        <div>
          <div className="mb-1 text-[11px] text-ink-subtle">{m.cp}/{m.ct} payée(s)</div>
          <Progress value={m.cp} max={m.ct} />
        </div>
      ),
    },
    ...(caps.moderate ? [{
      key: "actions", header: "Actions", align: "right",
      render: (m) => (
        <div className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          {m.status === "pending" && (
            <>
              <Button variant="success" size="xs" iconLeft={<Check size={14} />} onClick={() => navigate(`validate/${m.id}`)}>Valider</Button>
              <Button variant="outline" size="xs" iconLeft={<X size={14} />} onClick={() => navigate(`reject/${m.id}`)}>Rejeter</Button>
            </>
          )}
          {m.status === "active" && (
            <Button variant="outline" size="xs" onClick={() => navigate(`suspend/${m.id}`)}>Suspendre</Button>
          )}
          {m.status === "suspended" && (
            <Button variant="success" size="xs" onClick={() => doReactivate(m.id)}>Réactiver</Button>
          )}
        </div>
      ),
    }] : []),
  ];

  return (
    <>
      <PageHeader
        title="Membres"
        subtitle={`${members.length} membre(s) dans la tontine`}
        actions={
          caps.create && (
            <Button iconLeft={<Plus size={17} strokeWidth={2.2} />} onClick={() => navigate("create")}>
              Ajouter un membre
            </Button>
          )
        }
      />

      <div className="mb-4">
        <Tabs items={tabs} value={tab} onChange={setTab} />
      </div>

      <DataTable
        columns={columns}
        data={list}
        loading={loading}
        rowKey={(m) => m.id}
        onRowClick={(m) => navigate(`show/${m.id}`)}
        searchable
        searchKeys={["name", "phone"]}
        searchPlaceholder="Rechercher un membre…"
        pageSize={12}
        empty={{ icon: Users, title: "Aucun membre", message: "Aucun membre ne correspond à ce filtre." }}
      />

      <div className="toast-wrap">{toasts.map((t) => <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>)}</div>
    </>
  );
}

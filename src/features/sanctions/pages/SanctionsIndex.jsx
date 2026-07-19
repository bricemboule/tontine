import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Scale } from "lucide-react";
import { Av, fmtCFA, fmtDate } from "@/components/ui/index";
import { useApi } from "@/hooks/useApi";
import { PageHeader, Tabs, DataTable, Badge, StatusBadge, Button } from "@/design-system";

const displayStatus = (s) => (s === "active" ? "enforced" : s);

export default function SanctionsIndex({ caps = {} }) {
  const api = useApi();
  const navigate = useNavigate();
  const [sancs, setSancs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");

  useEffect(() => {
    api.getSanctions()
      .then((d) => setSancs(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [api]);

  const pending = sancs.filter((s) => s.status === "pending_president");
  const tabs = [
    { id: "all", label: "Toutes", count: sancs.length },
    { id: "active", label: "Actives", count: sancs.filter((s) => s.status === "active").length },
    { id: "pending_president", label: "À valider", count: pending.length },
    { id: "lifted", label: "Levées", count: sancs.filter((s) => s.status === "lifted").length },
  ];
  const list = tab === "all" ? sancs : sancs.filter((s) => s.status === tab);

  const columns = [
    {
      key: "name", header: "Membre / motif", width: "44%",
      render: (s) => (
        <div className="flex items-start gap-2.5">
          <Av name={s.name} id={s.mid} size={34} />
          <div className="min-w-0">
            <div className="font-semibold text-ink">{s.name}</div>
            <div className="mt-0.5 line-clamp-2 text-[12px] text-ink-muted">{s.reason}</div>
          </div>
        </div>
      ),
    },
    {
      key: "type", header: "Type",
      render: (s) => (
        <div className="flex flex-col items-start gap-1">
          <Badge variant="neutral">{s.type}</Badge>
          {s.fine > 0 && <span className="font-display text-[12px] font-bold text-danger">{fmtCFA(s.fine)}</span>}
        </div>
      ),
    },
    { key: "date", header: "Date", align: "right", render: (s) => <span className="text-ink-subtle">{fmtDate(s.date)}</span> },
    { key: "status", header: "Statut", render: (s) => <StatusBadge status={displayStatus(s.status)} /> },
  ];

  return (
    <>
      <PageHeader
        title="Sanctions"
        subtitle={pending.length > 0 ? `${pending.length} en attente du Président` : "Discipline et sanctions"}
        actions={
          caps.create && (
            <Button variant="danger" iconLeft={<Scale size={17} />} onClick={() => navigate("create")}>
              Proposer une sanction
            </Button>
          )
        }
      />

      <div className="mb-4"><Tabs items={tabs} value={tab} onChange={setTab} /></div>

      <DataTable
        columns={columns}
        data={list}
        loading={loading}
        rowKey={(s) => s.id}
        onRowClick={(s) => navigate(`show/${s.id}`)}
        searchable
        searchKeys={["name", "reason", "type"]}
        searchPlaceholder="Rechercher une sanction…"
        pageSize={12}
        empty={{ icon: Scale, title: "Aucune sanction", message: "Aucune sanction ne correspond à ce filtre." }}
      />
    </>
  );
}

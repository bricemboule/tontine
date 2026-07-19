import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, HandCoins, Wallet, Clock } from "lucide-react";
import { Av, fmtCFA, fmtDate, calcLoan } from "@/components/ui/index";
import { useApi } from "@/hooks/useApi";
import { PageHeader, StatCard, Tabs, DataTable, StatusBadge, Button } from "@/design-system";

function Progress({ value, max }) {
  const pct = Math.min(100, Math.round((value / Math.max(max, 1)) * 100));
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
      <div className="h-full rounded-full bg-primary-500" style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function PretsIndex({ caps = {} }) {
  const api = useApi();
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");

  useEffect(() => {
    api.getLoans()
      .then((d) => setLoans(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [api]);

  const tabs = [
    { id: "all", label: "Tous", count: loans.length },
    { id: "pending", label: "En attente", count: loans.filter((l) => l.status === "pending").length },
    { id: "active", label: "Actifs", count: loans.filter((l) => l.status === "active").length },
    { id: "paid", label: "Soldés", count: loans.filter((l) => l.status === "paid").length },
  ];
  const list = tab === "all" ? loans : loans.filter((l) => l.status === tab);
  const actL = loans.filter((l) => l.status === "active");
  const encours = actL.reduce((s, l) => { const d = calcLoan(l.amount, l.rate, l.months); return s + Math.max(0, d.total - l.paid); }, 0);

  const columns = [
    {
      key: "name", header: "Membre", width: "30%", sortable: true,
      render: (l) => (
        <div className="flex items-center gap-2.5">
          <Av name={l.name} id={l.mid} size={32} />
          <div>
            <div className="font-semibold text-ink">{l.name}</div>
            <div className="text-[11px] text-ink-subtle">{l.purpose || "—"} · {fmtDate(l.start)}</div>
          </div>
        </div>
      ),
    },
    { key: "amount", header: "Capital", align: "right", sortable: true, render: (l) => <span className="font-display font-bold">{fmtCFA(l.amount)}</span> },
    { key: "monthly", header: "Mensualité", align: "right", render: (l) => <span className="font-display font-semibold">{fmtCFA(calcLoan(l.amount, l.rate, l.months).monthly)}</span> },
    {
      key: "progress", header: "Progression", width: "170px",
      render: (l) => {
        const d = calcLoan(l.amount, l.rate, l.months);
        return (
          <div>
            <Progress value={l.paid} max={d.total} />
            <div className="mt-1 text-[10px] text-ink-subtle tabular-nums">{fmtCFA(l.paid)} / {fmtCFA(d.total)}</div>
          </div>
        );
      },
    },
    { key: "months", header: "Durée", align: "right", render: (l) => `${l.months} mois` },
    { key: "status", header: "Statut", render: (l) => <StatusBadge status={l.status} /> },
  ];

  return (
    <>
      <PageHeader
        title="Prêts"
        subtitle={actL.length > 0 ? `${fmtCFA(encours)} en encours` : "Gestion des prêts de la tontine"}
        actions={
          caps.create && (
            <Button iconLeft={<Plus size={17} strokeWidth={2.2} />} onClick={() => navigate("create")}>
              Nouveau prêt
            </Button>
          )
        }
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Prêts actifs" value={actL.length} icon={HandCoins} />
        <StatCard label="Encours total" value={fmtCFA(encours)} icon={Wallet} />
        <StatCard label="En attente" value={loans.filter((l) => l.status === "pending").length} sub="d'approbation" icon={Clock} />
      </div>

      <div className="mb-4"><Tabs items={tabs} value={tab} onChange={setTab} /></div>

      <DataTable
        columns={columns}
        data={list}
        loading={loading}
        rowKey={(l) => l.id}
        onRowClick={(l) => navigate(`show/${l.id}`)}
        searchable
        searchKeys={["name", "purpose"]}
        searchPlaceholder="Rechercher un prêt…"
        pageSize={12}
        empty={{ icon: HandCoins, title: "Aucun prêt", message: "Aucun prêt ne correspond à ce filtre." }}
      />
    </>
  );
}

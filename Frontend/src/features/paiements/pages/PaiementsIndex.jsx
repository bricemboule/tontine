import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Check, X, CreditCard } from "lucide-react";
import { fmtCFA } from "@/components/ui/index";
import { useApi } from "@/hooks/useApi";
import { useToast } from "@/hooks/useToast";
import { PageHeader, StatCard, Tabs, DataTable, StatusBadge, Button } from "@/design-system";

const METH = { orange_money: "Orange Money", mtn_momo: "MTN MoMo", virement: "Virement", especes: "Espèces" };

export default function PaiementsIndex() {
  const api = useApi();
  const { toast, toasts } = useToast();
  const navigate = useNavigate();
  const [pays, setPays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");

  useEffect(() => {
    api.getPayments()
      .then((d) => setPays(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [api]);

  const doValidate = async (id, e) => {
    e.stopPropagation();
    await api.validatePayment(id);
    setPays((p) => p.map((x) => (x.id === id ? { ...x, status: "success" } : x)));
    toast("Paiement validé ✓");
  };
  const doCancel = async (id, e) => {
    e.stopPropagation();
    await api.cancelPayment(id);
    setPays((p) => p.map((x) => (x.id === id ? { ...x, status: "cancelled" } : x)));
    toast("Paiement annulé");
  };

  const tabs = [
    { id: "all", label: "Tous", count: pays.length },
    { id: "success", label: "Validés", count: pays.filter((p) => p.status === "success").length },
    { id: "pending", label: "En attente", count: pays.filter((p) => p.status === "pending").length },
    { id: "failed", label: "Échoués", count: pays.filter((p) => p.status === "failed").length },
  ];
  const list = tab === "all" ? pays : pays.filter((p) => p.status === tab);
  const totalValide = pays.filter((p) => p.status === "success").reduce((s, p) => s + p.amount, 0);

  const columns = [
    {
      key: "ref", header: "Référence / objet", width: "30%", sortable: true,
      render: (p) => (
        <div>
          <div className="font-display font-bold text-ink">{p.ref}</div>
          <div className="text-[11px] text-ink-subtle">{p.desc || "—"}</div>
        </div>
      ),
    },
    { key: "name", header: "Membre", render: (p) => <span className="font-medium text-ink">{p.name}</span> },
    { key: "method", header: "Mode", render: (p) => METH[p.method] || p.method },
    { key: "amount", header: "Montant", align: "right", sortable: true, render: (p) => <span className="font-display font-extrabold">{fmtCFA(p.amount)}</span> },
    { key: "date", header: "Date", align: "right", render: (p) => <span className="text-ink-subtle">{p.date}</span> },
    {
      key: "status", header: "Statut", align: "right",
      render: (p) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <StatusBadge status={p.status} />
          {p.status === "pending" && (
            <>
              <Button variant="success" size="xs" iconOnly aria-label="Valider" onClick={(e) => doValidate(p.id, e)}><Check size={14} /></Button>
              <Button variant="ghost" size="xs" iconOnly aria-label="Annuler" onClick={(e) => doCancel(p.id, e)}><X size={14} /></Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Paiements"
        subtitle={`${fmtCFA(totalValide)} validés`}
        actions={<Button iconLeft={<Plus size={17} strokeWidth={2.2} />} onClick={() => navigate("create")}>Initier un paiement</Button>}
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total validé" value={fmtCFA(totalValide)} icon={CreditCard} />
        <StatCard label="En attente" value={pays.filter((p) => p.status === "pending").length} sub="à valider" icon={Check} />
        <StatCard label="Total opérations" value={pays.length} icon={CreditCard} />
      </div>

      <div className="mb-4"><Tabs items={tabs} value={tab} onChange={setTab} /></div>

      <DataTable
        columns={columns}
        data={list}
        loading={loading}
        rowKey={(p) => p.id}
        onRowClick={(p) => navigate(`show/${p.id}`)}
        searchable
        searchKeys={["ref", "name", "desc"]}
        searchPlaceholder="Rechercher un paiement…"
        pageSize={12}
        empty={{ icon: CreditCard, title: "Aucun paiement", message: "Aucun paiement ne correspond à ce filtre." }}
      />
      <div className="toast-wrap">{toasts.map((t) => <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>)}</div>
    </>
  );
}

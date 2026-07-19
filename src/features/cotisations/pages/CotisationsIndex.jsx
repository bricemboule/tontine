import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Coins, Plus, Layers, Wallet } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { fmtCFA, fmtDate } from "@/components/ui/index";
import {
  PageHeader, StatCard, Tabs, DataTable, StatusBadge, Button,
} from "@/design-system";

/* Écran unique partagé par tous les rôles. La seule différence entre
   les anciennes copies était l'autorisation de créer → prop `canCreate`. */
export default function CotisationsIndex({ canCreate = false }) {
  const api = useApi();
  const navigate = useNavigate();
  const [cotis, setCotis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");

  useEffect(() => {
    api.getCotisations()
      .then((d) => setCotis(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [api]);

  const tabs = [
    { id: "all", label: "Toutes", count: cotis.length },
    { id: "open", label: "Ouvertes", count: cotis.filter((c) => c.status === "open").length },
    { id: "closed", label: "Clôturées", count: cotis.filter((c) => c.status === "closed").length },
  ];
  const list = tab === "all" ? cotis : cotis.filter((c) => c.status === tab);
  const totalCollecte = cotis.reduce((s, c) => s + (c.montant_collecte || 0), 0);

  const columns = [
    {
      key: "label",
      header: "Cotisation",
      width: "34%",
      sortable: true,
      render: (c) => (
        <div>
          <div className="font-semibold text-ink">{c.label}</div>
          <div className="mt-0.5 text-[12px] text-ink-subtle">
            {fmtDate(c.date_debut)} → {fmtDate(c.date_fin)}
          </div>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Montant",
      align: "right",
      sortable: true,
      render: (c) => <span className="font-display font-bold">{fmtCFA(c.amount)}</span>,
    },
    { key: "total_inscrits", header: "Inscrits", align: "right", sortable: true, render: (c) => c.total_inscrits || 0 },
    { key: "paid", header: "Payé", align: "right", render: (c) => `${c.total_paid || 0}/${c.total_inscrits || 0}` },
    {
      key: "montant_collecte",
      header: "Collecté",
      align: "right",
      sortable: true,
      render: (c) => <span className="font-display font-semibold">{fmtCFA(c.montant_collecte || 0)}</span>,
    },
    { key: "status", header: "Statut", render: (c) => <StatusBadge status={c.status} /> },
  ];

  return (
    <>
      <PageHeader
        title="Cotisations"
        subtitle="Périodes de cotisation de la tontine"
        actions={
          canCreate && (
            <Button iconLeft={<Plus size={17} strokeWidth={2.2} />} onClick={() => navigate("create")}>
              Nouvelle cotisation
            </Button>
          )
        }
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total collecté" value={fmtCFA(totalCollecte)} icon={Wallet} />
        <StatCard label="Périodes ouvertes" value={cotis.filter((c) => c.status === "open").length} icon={Coins} />
        <StatCard label="Total périodes" value={cotis.length} icon={Layers} />
      </div>

      <div className="mb-4">
        <Tabs items={tabs} value={tab} onChange={setTab} />
      </div>

      <DataTable
        columns={columns}
        data={list}
        loading={loading}
        rowKey={(c) => c.id}
        onRowClick={(c) => navigate(`show/${c.id}`)}
        searchable
        searchKeys={["label"]}
        searchPlaceholder="Rechercher une cotisation…"
        pageSize={10}
        empty={{
          icon: Coins,
          title: "Aucune cotisation",
          message: canCreate
            ? "Créez une première période de cotisation pour démarrer."
            : "Aucune période de cotisation pour le moment.",
          action: canCreate && (
            <Button size="sm" iconLeft={<Plus size={16} />} onClick={() => navigate("create")}>
              Nouvelle cotisation
            </Button>
          ),
        }}
      />
    </>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shuffle, ListOrdered, Repeat } from "lucide-react";
import { Av, fmtCFA, fmtDate } from "@/components/ui/index";
import { useApi } from "@/hooks/useApi";
import { useToast } from "@/hooks/useToast";
import { PageHeader, DataTable, StatusBadge, Button, cn } from "@/design-system";

export default function ToursIndex() {
  const api = useApi();
  const { toast, toasts } = useToast();
  const navigate = useNavigate();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.getTours()
      .then((d) => setTours(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [api]);

  const doAuto = async (shuffle) => {
    setBusy(true);
    try {
      const t = await api.autoAssignTours(shuffle);
      if (Array.isArray(t)) setTours(t);
      toast(shuffle ? "Tirage au sort effectué ✓" : "Tours assignés par ordre d'inscription ✓");
    } catch (e) { toast(e.message, "error"); } finally { setBusy(false); }
  };

  const sorted = [...tours].sort((a, b) => a.pos - b.pos);
  const nextTour = sorted.find((t) => t.status === "pending");
  const done = tours.filter((t) => t.status === "completed").length;
  const pending = tours.filter((t) => t.status === "pending").length;

  const columns = [
    {
      key: "pos", header: "Pos.", width: "70px",
      render: (t) => {
        const isNext = nextTour && t.id === nextTour.id;
        return (
          <span className={cn(
            "grid h-8 w-8 place-items-center rounded-full border-2 font-display text-[13px] font-extrabold",
            t.status === "completed" ? "border-success-border bg-success-soft text-success"
              : isNext ? "border-info-border bg-info-soft text-info"
                : "border-line bg-surface-2 text-ink-subtle"
          )}>{t.pos}</span>
        );
      },
    },
    {
      key: "name", header: "Membre", width: "34%",
      render: (t) => {
        const isNext = nextTour && t.id === nextTour.id;
        return (
          <div className="flex items-center gap-2.5">
            <Av name={t.name} id={t.mid} size={32} />
            <div>
              <div className="font-semibold text-ink">{t.name}</div>
              {isNext && <span className="text-[10px] font-bold text-info">⟶ Prochain bénéficiaire</span>}
            </div>
          </div>
        );
      },
    },
    { key: "date", header: "Date prévue", render: (t) => fmtDate(t.date) },
    { key: "amount", header: "Montant reçu", align: "right", render: (t) => t.amount > 0 ? <span className="font-display font-extrabold text-success">{fmtCFA(t.amount)}</span> : <span className="text-ink-subtle">—</span> },
    { key: "status", header: "Statut", render: (t) => <StatusBadge status={t.status} /> },
  ];

  return (
    <>
      <PageHeader
        title="Tours de passage"
        subtitle={`${done} réalisé(s) · ${pending} en attente`}
        actions={
          <>
            <Button variant="outline" size="sm" loading={busy} iconLeft={<ListOrdered size={16} />} onClick={() => doAuto(false)}>
              Ordre d'inscription
            </Button>
            <Button size="sm" loading={busy} iconLeft={<Shuffle size={16} />} onClick={() => doAuto(true)}>
              Tirage au sort
            </Button>
          </>
        }
      />

      <DataTable
        columns={columns}
        data={sorted}
        loading={loading}
        rowKey={(t) => t.id}
        onRowClick={(t) => navigate(`show/${t.id}`)}
        empty={{ icon: Repeat, title: "Aucun tour assigné", message: "Utilisez le tirage au sort ou l'ordre d'inscription." }}
      />
      <div className="toast-wrap">{toasts.map((t) => <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>)}</div>
    </>
  );
}

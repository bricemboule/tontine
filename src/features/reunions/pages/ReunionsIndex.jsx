import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Clock, MapPin, CalendarDays } from "lucide-react";
import { fmtCFA, fmtDate } from "@/components/ui/index";
import { useApi } from "@/hooks/useApi";
import { useToast } from "@/hooks/useToast";
import { PageHeader, Card, StatusBadge, Button, EmptyState } from "@/design-system";

const Field = ({ label, children }) => (
  <div>
    <div className="mb-1 text-[9.5px] font-bold uppercase tracking-[0.08em] text-ink-subtle">{label}</div>
    {children}
  </div>
);

export default function ReunionsIndex({ caps = {} }) {
  const api = useApi();
  const { toast, toasts } = useToast();
  const navigate = useNavigate();
  const [meets, setMeets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMeetings()
      .then((d) => setMeets(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [api]);

  const doCancel = async (id, e) => {
    e.stopPropagation();
    await api.cancelMeeting(id);
    setMeets((p) => p.map((m) => (m.id === id ? { ...m, status: "cancelled" } : m)));
    toast("Réunion annulée");
  };

  const sorted = [...meets].sort((a, b) => (a.status === "upcoming" ? -1 : 1));

  return (
    <>
      <PageHeader
        title="Réunions"
        subtitle="Agenda des réunions de la tontine"
        actions={
          caps.manage && (
            <Button iconLeft={<Plus size={17} strokeWidth={2.2} />} onClick={() => navigate("create")}>
              Planifier une réunion
            </Button>
          )
        }
      />

      {loading ? (
        <div className="grid gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="h-[104px] animate-pulse" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <Card>
          <EmptyState icon={CalendarDays} title="Aucune réunion planifiée" message={caps.manage ? "Planifiez une réunion pour notifier les membres." : "Aucune réunion à venir."} />
        </Card>
      ) : (
        <div className="grid gap-3">
          {sorted.map((m) => (
            <Card
              key={m.id}
              className={`cursor-pointer transition hover:border-primary-300 ${m.status === "upcoming" ? "border-info-border" : ""}`}
              onClick={() => navigate(`show/${m.id}`)}
            >
              <div className="grid items-center gap-4 p-4 lg:grid-cols-[1.6fr_1fr_1fr_1fr_auto]">
                <div>
                  <StatusBadge status={m.status} />
                  <div className="mb-1 mt-2 font-display text-[15px] font-extrabold text-ink">{fmtDate(m.date)}</div>
                  <div className="flex items-center gap-3 text-[12px] text-ink-muted">
                    <span className="inline-flex items-center gap-1"><Clock size={13} />{m.time}</span>
                    <span className="inline-flex items-center gap-1"><MapPin size={13} />{m.location}</span>
                  </div>
                  <div className="mt-1 text-[11.5px] text-ink-subtle">{m.title}</div>
                </div>

                <Field label="Bénéficiaire">
                  <div className="text-[14px] font-bold text-ink">{m.beneficiary || "—"}</div>
                </Field>

                <Field label="Collecte">
                  {m.status === "done"
                    ? <div className="font-display text-[14px] font-extrabold text-success">{fmtCFA(m.collected || 0)}</div>
                    : <div className="text-[12px] text-ink-subtle">En attente</div>}
                </Field>

                <Field label="Présences">
                  <div className="text-[13px] text-ink tabular-nums">{m.attendees || 0}/{m.total || "?"} membres</div>
                </Field>

                {caps.manage && m.status === "upcoming" ? (
                  <div className="flex flex-col gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <Button variant="outline" size="xs" onClick={() => navigate(`edit/${m.id}`)}>Modifier</Button>
                    <Button variant="outline" size="xs" onClick={() => navigate(`close/${m.id}`)}>Clôturer</Button>
                    <Button variant="ghost" size="xs" onClick={(e) => doCancel(m.id, e)}>Annuler</Button>
                  </div>
                ) : <span />}
              </div>
            </Card>
          ))}
        </div>
      )}
      <div className="toast-wrap">{toasts.map((t) => <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>)}</div>
    </>
  );
}

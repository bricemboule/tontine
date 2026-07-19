import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Av, fmtCFA, fmtDate } from "@/components/ui/index";
import { useApi } from "@/hooks/useApi";
import { PageHeader, Card, CardHeader, CardTitle, StatusBadge } from "@/design-system";

export default function TourShow() {
  const { id } = useParams();
  const api = useApi();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);

  useEffect(() => {
    api.getTours().then((list) => {
      const t = list.find((x) => x.id === parseInt(id));
      if (t) setTour(t); else navigate("..");
    }).catch(() => navigate(".."));
  }, [id]);

  if (!tour) return <div className="grid place-items-center py-20 text-sm text-ink-subtle">Chargement…</div>;

  return (
    <>
      <PageHeader title={`Tour n° ${tour.pos}`} onBack={() => navigate("..")} />

      <Card className="max-w-lg">
        <CardHeader><CardTitle>Détails du tour</CardTitle></CardHeader>
        <div className="p-5">
          <div className="mb-4 flex items-center gap-3.5 border-b border-line-soft pb-4">
            <Av name={tour.name} id={tour.mid} size={52} />
            <div>
              <div className="font-display text-[16px] font-bold text-ink">{tour.name}</div>
              <div className="mt-0.5 text-[12px] text-ink-subtle">Position n° {tour.pos}</div>
            </div>
            <div className="ml-auto"><StatusBadge status={tour.status} /></div>
          </div>
          {[
            ["Date prévue", fmtDate(tour.date)],
            ["Montant reçu", tour.amount > 0 ? fmtCFA(tour.amount) : "En attente"],
          ].map(([l, v]) => (
            <div key={l} className="flex justify-between border-b border-line-soft py-2 text-[13px] last:border-0">
              <span className="text-ink-subtle">{l}</span>
              <span className="font-semibold text-ink">{v}</span>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

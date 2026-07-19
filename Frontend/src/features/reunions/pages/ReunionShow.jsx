import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fmtDate, fmtCFA } from "@/components/ui/index";
import { useApi } from "@/hooks/useApi";
import { PageHeader, Card, CardHeader, CardTitle, StatusBadge, Button } from "@/design-system";

function InfoRow({ label, value, strong }) {
  return (
    <div className="flex justify-between border-b border-line-soft py-2 text-[13px] last:border-0">
      <span className="text-ink-subtle">{label}</span>
      <span className={strong ? "font-display font-bold text-ink" : "font-semibold text-ink"}>{value}</span>
    </div>
  );
}

export default function ReunionShow({ caps = {} }) {
  const { id } = useParams();
  const api = useApi();
  const navigate = useNavigate();
  const [meet, setMeet] = useState(null);

  useEffect(() => {
    api.getMeetings().then((list) => {
      const m = list.find((x) => x.id === parseInt(id));
      if (m) setMeet(m); else navigate("../..", { relative: "path" });
    }).catch(() => navigate("../..", { relative: "path" }));
  }, [id]);

  if (!meet) return <div className="grid place-items-center py-20 text-sm text-ink-subtle">Chargement…</div>;

  const rate = meet.total ? Math.round((meet.attendees / meet.total) * 100) : 0;

  return (
    <>
      <PageHeader
        title={meet.title}
        subtitle={`${fmtDate(meet.date)} · ${meet.location}`}
        onBack={() => navigate("../..", { relative: "path" })}
        actions={
          <>
            <StatusBadge status={meet.status} />
            {caps.manage && meet.status === "upcoming" && (
              <Button variant="outline" size="sm" onClick={() => navigate(`../../close/${meet.id}`, { relative: "path" })}>Clôturer</Button>
            )}
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Informations</CardTitle></CardHeader>
          <div className="p-5">
            <InfoRow label="Date" value={fmtDate(meet.date)} />
            <InfoRow label="Heure" value={meet.time} />
            <InfoRow label="Lieu" value={meet.location} />
            <InfoRow label="Bénéficiaire" value={meet.beneficiary || "—"} />
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Résultats</CardTitle></CardHeader>
          <div className="p-5">
            {meet.status === "done" ? (
              <>
                <InfoRow label="Total collecté" value={fmtCFA(meet.collected || 0)} strong />
                <InfoRow label="Membres présents" value={`${meet.attendees || 0} / ${meet.total || "?"}`} strong />
                <InfoRow label="Taux de présence" value={`${rate}%`} strong />
              </>
            ) : (
              <p className="py-5 text-center text-[13px] text-ink-subtle">La réunion n'a pas encore eu lieu.</p>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}

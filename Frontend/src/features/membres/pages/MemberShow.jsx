import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Av, fmtCFA, fmtDate } from "@/components/ui/index";
import { useApi } from "@/hooks/useApi";
import { PageHeader, Card, CardHeader, CardTitle, StatusBadge } from "@/design-system";

const ROLE_LABELS = {
  admin: "Administrateur", president: "Président", secretaire: "Secrétaire",
  tresorier: "Trésorier", censeur: "Censeur", membre: "Membre",
};

export default function MemberShow() {
  const { id } = useParams();
  const api = useApi();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);

  useEffect(() => {
    api.getMemberById(parseInt(id)).then(setMember).catch(() => navigate("../..", { relative: "path" }));
  }, [id]);

  if (!member) return <div className="grid place-items-center py-20 text-sm text-ink-subtle">Chargement…</div>;

  const pct = Math.min(100, Math.round((member.cp / Math.max(member.ct, 1)) * 100));

  return (
    <>
      <PageHeader title="Fiche membre" onBack={() => navigate("../..", { relative: "path" })} />

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <Card className="h-fit">
          <div className="px-4 py-6 text-center">
            <div className="flex justify-center"><Av name={member.name} id={member.id} size={64} /></div>
            <div className="mt-3 font-display text-[17px] font-extrabold text-ink">{member.name}</div>
            <div className="mb-3 text-[12px] text-ink-subtle">{ROLE_LABELS[member.role] || member.role}</div>
            <div className="flex justify-center"><StatusBadge status={member.status} /></div>
            {member.status === "suspended" && member.suspension_reason && (
              <div className="mt-3 rounded-md border border-warning-border bg-warning-soft px-3 py-2 text-left text-[11.5px] text-ink">
                <strong>Motif :</strong> {member.suspension_reason}
              </div>
            )}
          </div>
          <div className="border-t border-line px-4 py-3">
            {[["Téléphone", member.phone], ["Email", member.email || "—"], ["Depuis", fmtDate(member.joined)], ["Tour n°", member.tour || "—"]].map(([l, v]) => (
              <div key={l} className="flex justify-between border-b border-line-soft py-1.5 text-[12.5px] last:border-0">
                <span className="text-ink-subtle">{l}</span>
                <span className="font-medium text-ink">{v}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="h-fit">
          <CardHeader><CardTitle>Cotisations</CardTitle></CardHeader>
          <div className="p-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[12.5px] text-ink-muted">Payées</span>
              <span className="font-display font-extrabold text-ink">{member.cp} / {member.ct}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-primary-500" style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[12.5px] text-ink-muted">Total versé</span>
              <span className="font-display font-bold text-ink tabular-nums">{fmtCFA(member.cp * 50000)}</span>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}

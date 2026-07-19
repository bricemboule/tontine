import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Av, fmtDate } from "@/components/ui/index";
import { useApi } from "@/hooks/useApi";
import { useToast } from "@/hooks/useToast";
import { PageHeader, Card, CardHeader, CardTitle, Button } from "@/design-system";

/* Carte de confirmation d'action sur un membre (valider / rejeter / suspendre).
   Mutualise le patron des 3 pages d'action.
   config: { title, cardTitle, noticeVariant, notice(member), reason, reasonLabel,
             reasonPlaceholder, confirmLabel, confirmingLabel, variant, run(api, id, reason), success(member) } */

const NOTICE = {
  info: "border-info-border bg-info-soft",
  warning: "border-warning-border bg-warning-soft",
  danger: "border-danger-border bg-danger-soft",
};

export default function MemberActionCard({ config }) {
  const { id } = useParams();
  const api = useApi();
  const { toast, toasts } = useToast();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getMemberById(parseInt(id)).then(setMember).catch(() => navigate("../..", { relative: "path" }));
  }, [id]);

  const doConfirm = async () => {
    if (config.reason && !reason.trim()) { toast("Le motif est obligatoire", "error"); return; }
    setLoading(true);
    try {
      await config.run(api, parseInt(id), reason);
      toast(config.success(member));
      setTimeout(() => navigate("../..", { relative: "path" }), 1000);
    } catch (e) { toast(e.message, "error"); } finally { setLoading(false); }
  };

  if (!member) return <div className="grid place-items-center py-20 text-sm text-ink-subtle">Chargement…</div>;

  return (
    <>
      <PageHeader title={config.title} onBack={() => navigate("../..", { relative: "path" })} />

      <Card className="max-w-xl">
        <CardHeader><CardTitle>{config.cardTitle}</CardTitle></CardHeader>
        <div className="flex flex-col gap-4 p-5">
          <div className="flex items-center gap-3.5 border-b border-line-soft pb-4">
            <Av name={member.name} id={member.id} size={52} />
            <div>
              <div className="font-display text-[16px] font-bold text-ink">{member.name}</div>
              <div className="mt-0.5 text-[12.5px] text-ink-subtle">{member.phone} · Rôle : {member.role}</div>
              <div className="text-[11.5px] text-ink-subtle">Demande soumise le {fmtDate(member.joined)}</div>
            </div>
          </div>

          <div className={`rounded-md border px-3.5 py-3 text-[13px] text-ink ${NOTICE[config.noticeVariant] || NOTICE.info}`}>
            {config.notice(member)}
          </div>

          {config.reason && (
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-semibold text-ink">{config.reasonLabel}</span>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={config.reasonPlaceholder}
                rows={3}
                className="w-full resize-y rounded-md border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink outline-none transition placeholder:text-ink-subtle focus:border-primary-500 focus:ring-2 focus:ring-brand"
              />
            </label>
          )}

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => navigate("../..", { relative: "path" })}>Annuler</Button>
            <Button
              variant={config.variant}
              fullWidth
              loading={loading}
              disabled={config.reason && !reason.trim()}
              onClick={doConfirm}
            >
              {loading ? config.confirmingLabel : config.confirmLabel}
            </Button>
          </div>
        </div>
      </Card>

      <div className="toast-wrap">{toasts.map((t) => <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>)}</div>
    </>
  );
}

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Check, X, ArrowUp } from "lucide-react";
import { Av, fmtCFA, fmtDate } from "@/components/ui/index";
import { useApi } from "@/hooks/useApi";
import { useToast } from "@/hooks/useToast";
import { PageHeader, Card, CardHeader, CardTitle, StatusBadge, Button, Modal } from "@/design-system";

const displayStatus = (s) => (s === "active" ? "enforced" : s);

function ReasonModal({ open, title, notice, noticeVariant, label, placeholder, confirmLabel, variant, value, setValue, loading, onClose, onConfirm }) {
  const noticeCls = { info: "border-info-border bg-info-soft", warning: "border-warning-border bg-warning-soft" }[noticeVariant] || "border-info-border bg-info-soft";
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button variant={variant} loading={loading} disabled={!value.trim()} onClick={onConfirm}>{confirmLabel}</Button>
        </>
      }
    >
      {notice && <div className={`mb-4 rounded-md border px-3.5 py-3 text-[13px] text-ink ${noticeCls}`}>{notice}</div>}
      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-semibold text-ink">{label}</span>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={3}
          placeholder={placeholder}
          className="w-full resize-y rounded-md border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink outline-none transition placeholder:text-ink-subtle focus:border-primary-500 focus:ring-2 focus:ring-brand"
        />
      </label>
    </Modal>
  );
}

export default function SanctionShow({ caps = {} }) {
  const { id } = useParams();
  const api = useApi();
  const { toast, toasts } = useToast();
  const navigate = useNavigate();
  const [sanction, setSanction] = useState(null);
  const [modalReject, setModalReject] = useState(false);
  const [modalLift, setModalLift] = useState(false);
  const [rejectR, setRejectR] = useState("");
  const [liftR, setLiftR] = useState("");
  const [loading, setLoading] = useState(false);

  const reload = async () => {
    const all = await api.getSanctions();
    const s = all.find((x) => x.id === parseInt(id));
    if (s) setSanction(s); else navigate("..");
  };

  useEffect(() => { reload().catch(() => navigate("..")); }, [id]);

  if (!sanction) return <div className="grid place-items-center py-20 text-sm text-ink-subtle">Chargement…</div>;

  const doValidate = async () => {
    setLoading(true);
    try { await api.validateSanction(sanction.id, "approve"); await reload(); toast("Sanction validée et appliquée ✓"); }
    catch (e) { toast(e.message, "error"); } finally { setLoading(false); }
  };
  const doReject = async () => {
    setLoading(true);
    try { await api.validateSanction(sanction.id, "reject", rejectR); await reload(); setModalReject(false); toast("Sanction rejetée"); }
    catch (e) { toast(e.message, "error"); } finally { setLoading(false); }
  };
  const doLift = async () => {
    setLoading(true);
    try { await api.liftSanction(sanction.id, liftR); await reload(); setModalLift(false); toast("Sanction levée ✓"); }
    catch (e) { toast(e.message, "error"); } finally { setLoading(false); }
  };

  return (
    <>
      <PageHeader
        title="Fiche de sanction"
        onBack={() => navigate("..")}
        actions={
          <>
            <StatusBadge status={displayStatus(sanction.status)} />
            {caps.moderate && sanction.status === "pending_president" && (
              <>
                <Button variant="success" size="sm" loading={loading} iconLeft={<Check size={15} />} onClick={doValidate}>Valider</Button>
                <Button variant="outline" size="sm" iconLeft={<X size={15} />} onClick={() => setModalReject(true)}>Rejeter</Button>
              </>
            )}
            {caps.lift && sanction.status === "active" && (
              <Button variant="outline" size="sm" iconLeft={<ArrowUp size={15} />} onClick={() => setModalLift(true)}>Lever la sanction</Button>
            )}
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Membre concerné</CardTitle></CardHeader>
          <div className="flex items-center gap-3.5 p-5">
            <Av name={sanction.name} id={sanction.mid} size={48} />
            <div>
              <div className="font-display text-[15px] font-bold text-ink">{sanction.name}</div>
              <div className="mt-0.5 text-[12px] text-ink-subtle">Sanction du {fmtDate(sanction.date)}</div>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Détails</CardTitle></CardHeader>
          <div className="p-5">
            {[["Type", sanction.type], ["Amende", sanction.fine > 0 ? fmtCFA(sanction.fine) : "Aucune"], ["Date d'effet", fmtDate(sanction.date)]].map(([l, v]) => (
              <div key={l} className="flex justify-between border-b border-line-soft py-1.5 text-[12.5px] last:border-0">
                <span className="text-ink-subtle">{l}</span>
                <span className="font-semibold text-ink">{v}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader><CardTitle>Motif</CardTitle></CardHeader>
        <p className="p-5 text-[13.5px] leading-relaxed text-ink-muted">{sanction.reason}</p>
      </Card>

      {sanction.lift_reason && (
        <Card className="mt-4">
          <CardHeader><CardTitle>Motif de levée</CardTitle></CardHeader>
          <p className="p-5 text-[13.5px] leading-relaxed text-success">{sanction.lift_reason}</p>
        </Card>
      )}

      {caps.moderate && (
        <ReasonModal
          open={modalReject} title="Rejeter la sanction" label="Motif du rejet *"
          placeholder="Expliquez pourquoi la sanction ne peut pas être appliquée…"
          confirmLabel="Rejeter" variant="danger" value={rejectR} setValue={setRejectR}
          loading={loading} onClose={() => setModalReject(false)} onConfirm={doReject}
        />
      )}
      {caps.lift && (
        <ReasonModal
          open={modalLift} title="Lever la sanction"
          notice="La levée réactivera le membre s'il était suspendu suite à cette sanction." noticeVariant="info"
          label="Motif de la levée *" placeholder="ex : Situation régularisée, amende payée, décision du bureau…"
          confirmLabel="Confirmer la levée" variant="success" value={liftR} setValue={setLiftR}
          loading={loading} onClose={() => setModalLift(false)} onConfirm={doLift}
        />
      )}
      <div className="toast-wrap">{toasts.map((t) => <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>)}</div>
    </>
  );
}

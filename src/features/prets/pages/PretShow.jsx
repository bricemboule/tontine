import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Check, X, Plus } from "lucide-react";
import { Av, fmtDate, calcLoan } from "@/components/ui/index";
import { useApi } from "@/hooks/useApi";
import { useToast } from "@/hooks/useToast";
import { PageHeader, StatusBadge, Button } from "@/design-system";
import PretStats from "@/features/prets/components/PretStats";
import PretProgress from "@/features/prets/components/PretProgress";
import PretSchedule from "@/features/prets/components/PretSchedule";
import PretRepayModal from "@/features/prets/components/PretRepayModal";
import PretRejectModal from "@/features/prets/components/PretRejectModal";

/* Détail d'un prêt — écran unique partagé.
   caps.moderate : approuver / rejeter · caps.repay : enregistrer un remboursement */
export default function PretShow({ caps = {} }) {
  const { id } = useParams();
  const api = useApi();
  const { toast, toasts } = useToast();
  const navigate = useNavigate();
  const [loan, setLoan] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [modalRepay, setModalRepay] = useState(false);
  const [modalReject, setModalReject] = useState(false);
  const [repayF, setRepayF] = useState({ amount: "", method: "especes" });
  const [rejectR, setRejectR] = useState("");
  const [loading, setLoading] = useState(false);

  const reload = async () => {
    setLoan(await api.getLoanById(parseInt(id)));
    setSchedule(await api.getLoanSchedule(parseInt(id)));
  };

  useEffect(() => { reload().catch(() => navigate("..")); }, [id]);

  if (!loan) return <div className="grid place-items-center py-20 text-sm text-ink-subtle">Chargement…</div>;

  const sim = calcLoan(loan.amount, loan.rate, loan.months);
  const pct = Math.min(100, Math.round((loan.paid / sim.total) * 100));

  const doApprove = async () => {
    setLoading(true);
    try { await api.approveLoan(loan.id); await reload(); toast("Prêt approuvé — fonds débloqués ✓"); }
    catch (e) { toast(e.message, "error"); } finally { setLoading(false); }
  };
  const doReject = async () => {
    if (!rejectR.trim()) { toast("Le motif est requis", "error"); return; }
    setLoading(true);
    try { await api.rejectLoan(loan.id, rejectR); await reload(); setModalReject(false); toast("Prêt rejeté"); }
    catch (e) { toast(e.message, "error"); } finally { setLoading(false); }
  };
  const doRepay = async () => {
    if (!repayF.amount) { toast("Montant requis", "error"); return; }
    setLoading(true);
    try {
      const { loan: l } = await api.repayLoan(loan.id, parseFloat(repayF.amount), repayF.method);
      await reload(); setModalRepay(false);
      toast(l.status === "paid" ? "Prêt intégralement soldé ✓" : "Remboursement enregistré ✓");
    } catch (e) { toast(e.message, "error"); } finally { setLoading(false); }
  };

  return (
    <>
      <PageHeader
        title={loan.name}
        subtitle={`${loan.purpose || "—"} · Depuis ${fmtDate(loan.start)}`}
        onBack={() => navigate("..")}
        actions={
          <>
            <StatusBadge status={loan.status} />
            {caps.moderate && loan.status === "pending" && (
              <>
                <Button variant="success" size="sm" loading={loading} iconLeft={<Check size={15} />} onClick={doApprove}>Approuver</Button>
                <Button variant="outline" size="sm" iconLeft={<X size={15} />} onClick={() => setModalReject(true)}>Rejeter</Button>
              </>
            )}
            {caps.repay && loan.status === "active" && (
              <Button size="sm" iconLeft={<Plus size={15} />} onClick={() => { setRepayF({ amount: String(sim.monthly), method: "especes" }); setModalRepay(true); }}>
                Remboursement
              </Button>
            )}
          </>
        }
      />

      <div className="mb-4 flex items-center gap-3">
        <Av name={loan.name} id={loan.mid} size={38} />
        <div className="text-[13px] text-ink-muted">{loan.rate}%/an · {loan.months} mois</div>
      </div>

      <PretStats loan={loan} simulation={sim} />
      <PretProgress loan={loan} simulation={sim} percent={pct} />
      <PretSchedule schedule={schedule} />

      {caps.moderate && (
        <PretRejectModal open={modalReject} reason={rejectR} setReason={setRejectR} loading={loading} onClose={() => setModalReject(false)} onConfirm={doReject} />
      )}
      {caps.repay && (
        <PretRepayModal open={modalRepay} loan={loan} simulation={sim} form={repayF} setForm={setRepayF} loading={loading} onClose={() => setModalRepay(false)} onConfirm={doRepay} />
      )}
      <div className="toast-wrap">{toasts.map((t) => <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>)}</div>
    </>
  );
}

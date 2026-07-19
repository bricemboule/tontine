import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UserPlus, CreditCard, X } from "lucide-react";
import { Av, fmtCFA, fmtDate } from "@/components/ui/index";
import { useApi } from "@/hooks/useApi";
import { useToast } from "@/hooks/useToast";
import {
  PageHeader, Card, CardHeader, CardTitle, CardSubtitle, StatusBadge, Button, DataTable,
} from "@/design-system";
import CotisationStats from "@/features/cotisations/components/CotisationStats";
import BeneficiaryProgressCards from "@/features/cotisations/components/BeneficiaryProgressCards";
import CotisationPaymentModal from "@/features/cotisations/components/CotisationPaymentModal";
import EnrollMembersModal from "@/features/cotisations/components/EnrollMembersModal";

/* Détail d'une cotisation — écran unique partagé. Les capacités
   (inscrire, payer, clôturer, désinscrire) sont gouvernées par `caps`. */
export default function CotisationShow({ caps = {} }) {
  const { id } = useParams();
  const api = useApi();
  const { toast, toasts } = useToast();
  const navigate = useNavigate();
  const [cotis, setCotis] = useState(null);
  const [members, setMembers] = useState([]);
  const [tours, setTours] = useState([]);
  const [showEnroll, setShowEnroll] = useState(false);
  const [enrollSel, setEnrollSel] = useState([]);
  const [modalPay, setModalPay] = useState(false);
  const [payForm, setPayForm] = useState({ mid: "", amount: "", method: "especes" });
  const [loading, setLoading] = useState(false);

  const reload = async () => setCotis(await api.getCotisationById(parseInt(id)));

  useEffect(() => {
    reload().catch(() => navigate(".."));
    api.getMembers().then(setMembers).catch(() => {});
    api.getTours().then(setTours).catch(() => {});
  }, [id]);

  if (!cotis) {
    return <div className="grid place-items-center py-20 text-sm text-ink-subtle">Chargement…</div>;
  }

  const nonInscrits = members.filter((m) => m.status === "active" && !cotis.inscrits?.find((i) => i.member_id === m.id));
  const nbPaid = cotis.inscrits?.filter((i) => i.status === "paid").length || 0;
  const totalCollecte = cotis.inscrits?.reduce((s, i) => s + i.amount_paid, 0) || 0;
  const taux = cotis.inscrits?.length ? Math.round((nbPaid / cotis.inscrits.length) * 100) : 0;
  const activeMembers = members.filter((m) => m.status === "active");
  const completedByMember = new Set(tours.filter((t) => t.status === "completed").map((t) => Number(t.mid)));
  const tourByMember = new Map(tours.map((t) => [Number(t.mid), t]));
  const memberName = (m) => m.name || `${m.first_name || ""} ${m.last_name || ""}`.trim();
  const alreadyBenefited = activeMembers.filter((m) => completedByMember.has(Number(m.id)));
  const notYetBenefited = activeMembers.filter((m) => !completedByMember.has(Number(m.id)));
  const isOpen = cotis.status === "open";
  const rowActions = isOpen && (caps.pay || caps.unenroll);

  const doEnroll = async () => {
    if (!enrollSel.length) { toast("Sélectionnez au moins un membre", "error"); return; }
    setLoading(true);
    try {
      await api.enrollMembers(cotis.id, enrollSel);
      await reload(); setShowEnroll(false); setEnrollSel([]);
      toast(`${enrollSel.length} membre(s) inscrit(s) ✓`);
    } catch (e) { toast(e.message, "error"); } finally { setLoading(false); }
  };
  const doUnenroll = async (mid) => { await api.unenrollMember(cotis.id, mid); await reload(); toast("Membre désinscrit"); };
  const doPay = async () => {
    if (!payForm.mid || !payForm.amount) { toast("Champs requis", "error"); return; }
    setLoading(true);
    try {
      await api.payCotisation(cotis.id, parseInt(payForm.mid), parseFloat(payForm.amount), payForm.method);
      await reload(); setModalPay(false); setPayForm({ mid: "", amount: "", method: "especes" });
      toast("Paiement enregistré ✓");
    } catch (e) { toast(e.message, "error"); } finally { setLoading(false); }
  };
  const doClose = async () => { await api.closeCotisation(cotis.id); await reload(); toast("Cotisation clôturée"); };

  const columns = [
    {
      key: "member_name", header: "Membre", width: "40%",
      render: (ins) => (
        <div className="flex items-center gap-2.5">
          <Av name={ins.member_name} id={ins.member_id} size={30} />
          <span className="font-semibold text-ink">{ins.member_name}</span>
        </div>
      ),
    },
    { key: "status", header: "Statut", render: (ins) => <StatusBadge status={ins.status} /> },
    {
      key: "amount_paid", header: "Montant payé", align: "right",
      render: (ins) => (
        <div>
          <div className="font-display font-bold">{fmtCFA(ins.amount_paid)}</div>
          {ins.amount_paid > 0 && ins.amount_paid < cotis.amount && (
            <div className="text-[11px] text-warning">Reste : {fmtCFA(cotis.amount - ins.amount_paid)}</div>
          )}
        </div>
      ),
    },
    ...(rowActions ? [{
      key: "actions", header: "Actions", align: "right",
      render: (ins) => (
        <div className="flex justify-end gap-1.5">
          {caps.pay && ins.status !== "paid" && (
            <Button variant="success" size="xs" onClick={() => { setPayForm({ mid: String(ins.member_id), amount: String(cotis.amount - ins.amount_paid), method: "especes" }); setModalPay(true); }}>
              Payer
            </Button>
          )}
          {caps.unenroll && (
            <Button variant="ghost" size="xs" iconOnly aria-label="Désinscrire" onClick={() => doUnenroll(ins.member_id)}>
              <X size={15} />
            </Button>
          )}
        </div>
      ),
    }] : []),
  ];

  return (
    <>
      <PageHeader
        title={cotis.label}
        subtitle={`${fmtDate(cotis.date_debut)} → ${fmtDate(cotis.date_fin)}`}
        onBack={() => navigate("..")}
        actions={
          <>
            <StatusBadge status={cotis.status} />
            {caps.close && isOpen && <Button variant="outline" size="sm" onClick={doClose}>Clôturer</Button>}
          </>
        }
      />

      <CotisationStats cotisation={cotis} nbPaid={nbPaid} totalCollecte={totalCollecte} taux={taux} />

      <BeneficiaryProgressCards
        alreadyBenefited={alreadyBenefited}
        notYetBenefited={notYetBenefited}
        tourByMember={tourByMember}
        memberName={memberName}
      />

      <Card className="mb-4">
        <CardHeader>
          <div>
            <CardTitle>Informations</CardTitle>
            <CardSubtitle>Détails de la période</CardSubtitle>
          </div>
          {isOpen && (caps.enroll || caps.pay) && (
            <div className="flex gap-2">
              {caps.enroll && (
                <Button variant="secondary" size="sm" iconLeft={<UserPlus size={16} />} onClick={() => setShowEnroll(true)}>
                  Inscrire
                </Button>
              )}
              {caps.pay && (
                <Button variant="success" size="sm" iconLeft={<CreditCard size={16} />} onClick={() => setModalPay(true)}>
                  Payer
                </Button>
              )}
            </div>
          )}
        </CardHeader>
        <div className="grid gap-3 p-5 sm:grid-cols-3">
          {[["Début", fmtDate(cotis.date_debut)], ["Fin", fmtDate(cotis.date_fin)], ["Créée le", fmtDate(cotis.created_at)]].map(([l, v]) => (
            <div key={l} className="rounded-md border border-line bg-surface-2 px-3 py-2.5">
              <div className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-ink-subtle">{l}</div>
              <div className="text-[13px] font-semibold text-ink">{v}</div>
            </div>
          ))}
        </div>
      </Card>

      <div className="mb-2 text-[13px] font-semibold text-ink-muted">
        Membres inscrits ({cotis.inscrits?.length || 0})
      </div>
      <DataTable
        columns={columns}
        data={cotis.inscrits || []}
        rowKey={(ins) => ins.member_id}
        empty={{
          icon: UserPlus,
          title: "Aucun membre inscrit",
          message: caps.enroll ? "Cliquez sur « Inscrire » pour ajouter des membres." : "Aucun membre inscrit à cette cotisation.",
        }}
      />

      {caps.enroll && (
        <EnrollMembersModal
          open={showEnroll}
          nonInscrits={nonInscrits}
          enrollSel={enrollSel}
          setEnrollSel={setEnrollSel}
          loading={loading}
          onClose={() => setShowEnroll(false)}
          onConfirm={doEnroll}
        />
      )}
      {caps.pay && (
        <CotisationPaymentModal
          open={modalPay}
          cotisation={cotis}
          payForm={payForm}
          setPayForm={setPayForm}
          loading={loading}
          onClose={() => setModalPay(false)}
          onConfirm={doPay}
        />
      )}
      <div className="toast-wrap">{toasts.map((t) => <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>)}</div>
    </>
  );
}

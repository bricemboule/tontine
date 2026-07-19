import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Check, X, Undo2 } from "lucide-react";
import { fmtCFA } from "@/components/ui/index";
import { useApi } from "@/hooks/useApi";
import { useToast } from "@/hooks/useToast";
import { PageHeader, Card, CardHeader, CardTitle, StatusBadge, Button } from "@/design-system";

const METH = { orange_money: "Orange Money", mtn_momo: "MTN MoMo", virement: "Virement bancaire", especes: "Espèces" };

/* Détail d'un paiement — écran partagé.
   caps.reverse : annulation par contre-écriture d'un paiement déjà validé (admin). */
export default function PaiementShow({ caps = {} }) {
  const { id } = useParams();
  const api = useApi();
  const { toast, toasts } = useToast();
  const navigate = useNavigate();
  const [pay, setPay] = useState(null);

  useEffect(() => {
    api.getPayments().then((list) => {
      const p = list.find((x) => x.id === parseInt(id));
      if (p) setPay(p); else navigate("..");
    }).catch(() => navigate(".."));
  }, [id]);

  const doValidate = async () => { await api.validatePayment(pay.id); setPay((p) => ({ ...p, status: "success" })); toast("Paiement validé ✓"); };
  const doCancel = async () => { await api.cancelPayment(pay.id); setPay((p) => ({ ...p, status: "cancelled" })); toast("Paiement annulé"); };
  const doReverse = async () => {
    const reason = window.prompt(
      "Annuler ce paiement DÉJÀ validé par contre-écriture ?\nLe montant sera ressorti de la caisse. Motif :",
      "Correction d'erreur de saisie"
    );
    if (reason === null) return;
    try {
      await api.reversePayment(pay.id, reason || "Correction d'erreur");
      setPay((p) => ({ ...p, status: "reversed" }));
      toast("Paiement annulé (contre-écriture) ✓");
    } catch (err) { toast(err.message, "error"); }
  };

  if (!pay) return <div className="grid place-items-center py-20 text-sm text-ink-subtle">Chargement…</div>;

  const rows = [
    ["Référence", pay.ref],
    ["Membre", pay.name],
    ["Montant", fmtCFA(pay.amount)],
    ["Mode", METH[pay.method] || pay.method],
    ["Objet", pay.desc || "—"],
    ["Date", pay.date],
  ];

  return (
    <>
      <PageHeader
        title={pay.ref}
        subtitle={METH[pay.method] || pay.method}
        onBack={() => navigate("..")}
        actions={
          <>
            <StatusBadge status={pay.status} />
            {pay.status === "pending" && (
              <>
                <Button variant="success" size="sm" iconLeft={<Check size={15} />} onClick={doValidate}>Valider</Button>
                <Button variant="outline" size="sm" iconLeft={<X size={15} />} onClick={doCancel}>Annuler</Button>
              </>
            )}
            {caps.reverse && pay.status === "success" && (
              <Button variant="outline" size="sm" iconLeft={<Undo2 size={15} />} onClick={doReverse}>Contre-écriture</Button>
            )}
          </>
        }
      />

      <Card className="max-w-xl">
        <CardHeader><CardTitle>Détails du paiement</CardTitle></CardHeader>
        <div className="p-5">
          {rows.map(([l, v]) => (
            <div key={l} className="flex justify-between border-b border-line-soft py-2.5 text-[13px] last:border-0">
              <span className="text-ink-subtle">{l}</span>
              <span className={l === "Montant" ? "font-display font-extrabold text-ink" : "font-semibold text-ink"}>{v}</span>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-line pt-3 text-[13px]">
            <span className="text-ink-subtle">Statut</span>
            <StatusBadge status={pay.status} />
          </div>
        </div>
      </Card>
      <div className="toast-wrap">{toasts.map((t) => <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>)}</div>
    </>
  );
}

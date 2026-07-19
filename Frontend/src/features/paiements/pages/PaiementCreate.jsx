import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fmtCFA } from "@/components/ui/index";
import { useApi } from "@/hooks/useApi";
import { useToast } from "@/hooks/useToast";
import { PageHeader, Card, CardHeader, CardTitle, CardSubtitle, InputField, Select, Button } from "@/design-system";

const METH_LABEL = { especes: "Espèces", orange_money: "Orange Money", mtn_momo: "MTN MoMo", virement: "Virement" };

export default function PaiementCreate() {
  const api = useApi();
  const { toast, toasts } = useToast();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({ mid: "", amount: "", method: "especes", desc: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  // Clé d'idempotence stable pour CETTE saisie (double-clic / retry réseau),
  // régénérée après un enregistrement réussi.
  const idempotencyKey = useRef(crypto.randomUUID());
  const ff = (k, v) => { setForm((p) => ({ ...p, [k]: v })); setErrors((p) => ({ ...p, [k]: "" })); };

  useEffect(() => {
    api.getMembers().then((m) => setMembers(m.filter((x) => x.status === "active"))).catch(() => {});
  }, [api]);

  const isMobile = ["orange_money", "mtn_momo"].includes(form.method);

  const validate = () => {
    const e = {};
    if (!form.mid) e.mid = "Sélectionnez un membre";
    if (!form.amount) e.amount = "Le montant est requis";
    if (!form.desc.trim()) e.desc = "L'objet est requis";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const p = await api.initiatePayment(
        { member_id: parseInt(form.mid), amount: parseFloat(form.amount), method: form.method, description: form.desc },
        idempotencyKey.current
      );
      idempotencyKey.current = crypto.randomUUID();
      toast("Paiement initié ✓");
      setTimeout(() => navigate("..", { relative: "path" }), 1000);
    } catch (err) { toast(err.message, "error"); } finally { setLoading(false); }
  };

  const recap = [
    ["Membre", members.find((m) => m.id === parseInt(form.mid))?.name || "—"],
    ["Montant", form.amount ? fmtCFA(parseFloat(form.amount)) : "—"],
    ["Mode", METH_LABEL[form.method]],
    ["Objet", form.desc || "—"],
    ["Statut initial", isMobile ? "En traitement" : "En attente"],
  ];

  return (
    <>
      <PageHeader title="Initier un paiement" onBack={() => navigate("..", { relative: "path" })} />

      <div className="grid items-start gap-4 lg:grid-cols-[1fr_300px]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Nouveau paiement</CardTitle>
              <CardSubtitle>Cotisation, remboursement de prêt, amende…</CardSubtitle>
            </div>
          </CardHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
            <Select label="Membre" value={form.mid} onChange={(e) => ff("mid", e.target.value)} error={errors.mid}>
              <option value="">— Sélectionner un membre —</option>
              {members.map((m) => <option key={m.id} value={m.id}>{m.name} · {m.phone}</option>)}
            </Select>

            <div className="grid gap-4 sm:grid-cols-2">
              <InputField label="Montant (FCFA)" type="number" min="1" value={form.amount} onChange={(e) => ff("amount", e.target.value)} placeholder="ex : 50 000" error={errors.amount} />
              <Select label="Mode de paiement" value={form.method} onChange={(e) => ff("method", e.target.value)}>
                <option value="especes">Espèces</option>
                <option value="orange_money">Orange Money</option>
                <option value="mtn_momo">MTN MoMo</option>
                <option value="virement">Virement bancaire</option>
              </Select>
            </div>

            <InputField label="Objet du paiement" value={form.desc} onChange={(e) => ff("desc", e.target.value)} placeholder="ex : Cotisation avril 2026, remboursement prêt…" error={errors.desc} />

            <div className={`rounded-md border px-3.5 py-3 text-[13px] text-ink ${isMobile ? "border-info-border bg-info-soft" : "border-warning-border bg-warning-soft"}`}>
              {isMobile
                ? "Une demande de paiement sera envoyée sur le téléphone du membre. Confirmation automatique."
                : "Paiement manuel — restera « En attente » jusqu'à validation par le trésorier après réception des fonds."}
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => navigate("..", { relative: "path" })}>Annuler</Button>
              <Button type="submit" loading={loading} fullWidth>{loading ? "Initialisation…" : "Initier le paiement"}</Button>
            </div>
          </form>
        </Card>

        <Card className="lg:sticky lg:top-[76px]">
          <CardHeader><CardTitle>Résumé</CardTitle></CardHeader>
          <dl className="flex flex-col p-5">
            {recap.map(([l, v], i) => (
              <div key={l} className={`flex justify-between gap-3 py-[7px] text-[13px] ${i < recap.length - 1 ? "border-b border-line-soft" : ""}`}>
                <dt className="text-ink-muted">{l}</dt>
                <dd className="font-semibold text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>
      <div className="toast-wrap">{toasts.map((t) => <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>)}</div>
    </>
  );
}

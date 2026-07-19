import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "@/hooks/useApi";
import { useToast } from "@/hooks/useToast";
import { fmtCFA, calcLoan } from "@/components/ui/index";
import { PageHeader, Card, CardHeader, CardTitle, CardSubtitle, InputField, Select, Button } from "@/design-system";

export default function PretCreate() {
  const api = useApi();
  const { toast, toasts } = useToast();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({ mid: "", amount: "", rate: 5, months: 3, purpose: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const ff = (k, v) => { setForm((p) => ({ ...p, [k]: v })); setErrors((p) => ({ ...p, [k]: "" })); };

  useEffect(() => {
    api.getMembers().then((m) => setMembers(m.filter((x) => x.status === "active"))).catch(() => {});
  }, [api]);

  const sim = form.amount > 0 ? calcLoan(parseFloat(form.amount) || 0, form.rate, form.months) : null;

  const validate = () => {
    const e = {};
    if (!form.mid) e.mid = "Sélectionnez un membre";
    if (!form.amount) e.amount = "Le montant est requis";
    if (!form.purpose.trim()) e.purpose = "L'objet du prêt est requis";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const l = await api.createLoan({ member_id: parseInt(form.mid), amount: parseFloat(form.amount), interest_rate: form.rate, months: form.months, purpose: form.purpose });
      toast("Demande de prêt soumise au Président ✓");
      setTimeout(() => navigate(`../show/${l.id}`), 1000);
    } catch (err) { toast(err.message, "error"); } finally { setLoading(false); }
  };

  return (
    <>
      <PageHeader title="Nouvelle demande de prêt" onBack={() => navigate("..")} />

      <div className="grid items-start gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Paramètres du prêt</CardTitle>
              <CardSubtitle>La demande sera soumise au Président pour approbation.</CardSubtitle>
            </div>
          </CardHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
            <Select label="Membre bénéficiaire" value={form.mid} onChange={(e) => ff("mid", e.target.value)} error={errors.mid}>
              <option value="">— Sélectionner un membre actif —</option>
              {members.map((m) => <option key={m.id} value={m.id}>{m.name} · {m.phone}</option>)}
            </Select>

            <InputField label="Montant demandé (FCFA)" type="number" min="1000" value={form.amount} onChange={(e) => ff("amount", e.target.value)} placeholder="ex : 150 000" error={errors.amount} />

            <InputField label="Taux d'intérêt annuel (%)" type="number" step="0.5" min="0" max="100" value={form.rate} onChange={(e) => ff("rate", parseFloat(e.target.value) || 0)} />

            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-semibold text-ink">
                Durée de remboursement : <strong className="text-primary-700">{form.months} mois</strong>
              </label>
              <input type="range" min="1" max="24" step="1" value={form.months} onChange={(e) => ff("months", parseInt(e.target.value))} className="w-full accent-primary-600" />
              <div className="flex justify-between text-[10.5px] text-ink-subtle">
                <span>1 mois</span><span>6</span><span>12</span><span>24 mois</span>
              </div>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-semibold text-ink">Objet du prêt</span>
              <textarea
                value={form.purpose}
                onChange={(e) => ff("purpose", e.target.value)}
                rows={3}
                placeholder="Santé, éducation, commerce, investissement…"
                className="w-full resize-y rounded-md border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink outline-none transition placeholder:text-ink-subtle focus:border-primary-500 focus:ring-2 focus:ring-brand"
              />
              {errors.purpose && <span className="text-[12px] font-medium text-danger">{errors.purpose}</span>}
            </label>

            <div className="rounded-md border border-info-border bg-info-soft px-3.5 py-3 text-[13px] text-ink">
              Le Président sera notifié pour approuver ou rejeter cette demande. Les fonds seront débloqués après approbation.
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => navigate("..")}>Annuler</Button>
              <Button type="submit" loading={loading} fullWidth>
                {loading ? "Soumission…" : "Soumettre la demande"}
              </Button>
            </div>
          </form>
        </Card>

        <Card className="lg:sticky lg:top-[76px]">
          <CardHeader><CardTitle>Simulation en temps réel</CardTitle></CardHeader>
          <div className="p-5">
            {!sim ? (
              <p className="py-4 text-center text-[13px] text-ink-subtle">Saisissez un montant pour voir la simulation.</p>
            ) : (
              <>
                <dl className="flex flex-col">
                  {[
                    ["Capital demandé", fmtCFA(parseFloat(form.amount) || 0), false],
                    ["Taux", `${form.rate}%/an → ${(form.rate / 12).toFixed(2)}%/mois`, false],
                    ["Durée", `${form.months} mois`, false],
                    ["Intérêts totaux", fmtCFA(sim.interest), false],
                    ["Mensualité", fmtCFA(sim.monthly), true],
                    ["Total à rembourser", fmtCFA(sim.total), true],
                  ].map(([l, v, bold], i, arr) => (
                    <div key={l} className={`flex justify-between gap-3 py-[7px] text-[13px] ${i < arr.length - 1 ? "border-b border-line-soft" : ""}`}>
                      <dt className="text-ink-muted">{l}</dt>
                      <dd className={`font-display tabular-nums ${bold ? "font-extrabold text-ink" : "font-medium text-ink"}`}>{v}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-4 border-t border-line pt-3">
                  <div className="mb-2 text-[10.5px] font-bold uppercase tracking-[0.08em] text-ink-subtle">Échéancier</div>
                  <div className="max-h-[150px] overflow-y-auto">
                    {Array.from({ length: form.months }, (_, i) => (
                      <div key={i} className="flex justify-between border-b border-line-soft py-1 text-[12px] last:border-0">
                        <span className="text-ink-subtle">Mois {i + 1}</span>
                        <span className="font-display font-semibold tabular-nums text-ink">
                          {fmtCFA(i === form.months - 1 ? sim.total - sim.monthly * (form.months - 1) : sim.monthly)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      <div className="toast-wrap">{toasts.map((t) => <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>)}</div>
    </>
  );
}

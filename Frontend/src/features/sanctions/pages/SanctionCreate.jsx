import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "@/hooks/useApi";
import { useToast } from "@/hooks/useToast";
import { Av, fmtCFA } from "@/components/ui/index";
import { PageHeader, Card, CardHeader, CardTitle, CardSubtitle, InputField, Select, Button, cn } from "@/design-system";

const TYPES = [
  { type: "Retard paiement", fine: 2000, desc: "Cotisation payée après la date limite" },
  { type: "Absence réunion", fine: 5000, desc: "Absence non justifiée à une réunion" },
  { type: "Comportement", fine: 10000, desc: "Comportement contraire au règlement" },
  { type: "Non-respect règlement", fine: 15000, desc: "Infraction grave au règlement intérieur" },
  { type: "Suspension", fine: 0, desc: "Exclusion temporaire de toutes activités" },
];

export default function SanctionCreate() {
  const api = useApi();
  const { toast, toasts } = useToast();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({ mid: "", type: "Retard paiement", reason: "", fine: 2000, date: new Date().toISOString().slice(0, 10) });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const ff = (k, v) => { setForm((p) => ({ ...p, [k]: v })); setErrors((p) => ({ ...p, [k]: "" })); };

  useEffect(() => {
    api.getMembers().then((m) => setMembers(m.filter((x) => ["active", "suspended"].includes(x.status)))).catch(() => {});
  }, [api]);

  const selectedMember = members.find((m) => m.id === parseInt(form.mid));
  const typeInfo = TYPES.find((t) => t.type === form.type);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.mid) errs.mid = "Sélectionnez un membre";
    if (!form.reason.trim()) errs.reason = "Le motif est obligatoire";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const s = await api.proposeSanction({ member_id: parseInt(form.mid), type: form.type, reason: form.reason, fine: form.fine, start_date: form.date });
      toast("Sanction soumise au Président pour validation ✓");
      setTimeout(() => navigate("..", { relative: "path" }), 1000);
    } catch (err) { toast(err.message, "error"); } finally { setLoading(false); }
  };

  return (
    <>
      <PageHeader title="Proposer une sanction" onBack={() => navigate("..", { relative: "path" })} />

      <div className="grid items-start gap-4 lg:grid-cols-[1fr_300px]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Nouvelle proposition de sanction</CardTitle>
              <CardSubtitle>Sera soumise au Président pour validation avant application.</CardSubtitle>
            </div>
          </CardHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
            <Select label="Membre concerné" value={form.mid} onChange={(e) => ff("mid", e.target.value)} error={errors.mid}>
              <option value="">— Sélectionner un membre —</option>
              {members.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.status === "suspended" ? "suspendu" : "actif"})</option>)}
            </Select>

            <div className="flex flex-col gap-2">
              <span className="text-[13px] font-semibold text-ink">Type de sanction</span>
              {TYPES.map((t) => (
                <label
                  key={t.type}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2.5 transition",
                    form.type === t.type ? "border-danger bg-danger-soft" : "border-line bg-surface-2 hover:border-line"
                  )}
                >
                  <input type="radio" name="type" value={t.type} checked={form.type === t.type} onChange={() => { ff("type", t.type); ff("fine", t.fine); }} className="h-4 w-4 accent-danger" />
                  <div className="flex-1">
                    <div className="text-[13px] font-semibold text-ink">{t.type}</div>
                    <div className="text-[11px] text-ink-subtle">{t.desc}</div>
                  </div>
                  <span className={cn("font-display text-[13px] font-bold", t.fine > 0 ? "text-danger" : "text-ink-subtle")}>
                    {t.fine > 0 ? fmtCFA(t.fine) : "Pas d'amende"}
                  </span>
                </label>
              ))}
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-semibold text-ink">Motif détaillé (obligatoire)</span>
              <textarea
                value={form.reason}
                onChange={(e) => ff("reason", e.target.value)}
                rows={3}
                placeholder="Décrivez précisément les faits : date, circonstances, témoins éventuels…"
                className="w-full resize-y rounded-md border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink outline-none transition placeholder:text-ink-subtle focus:border-primary-500 focus:ring-2 focus:ring-brand"
              />
              {errors.reason && <span className="text-[12px] font-medium text-danger">{errors.reason}</span>}
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <InputField label="Amende personnalisée (FCFA)" type="number" min="0" value={form.fine} onChange={(e) => ff("fine", parseFloat(e.target.value) || 0)} />
              <InputField label="Date d'effet" type="date" value={form.date} onChange={(e) => ff("date", e.target.value)} />
            </div>

            <div className="rounded-md border border-warning-border bg-warning-soft px-3.5 py-3 text-[13px] text-ink">
              Le Président sera notifié immédiatement. La sanction ne sera appliquée qu'après sa validation.
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => navigate("..", { relative: "path" })}>Annuler</Button>
              <Button type="submit" variant="danger" loading={loading} fullWidth>
                {loading ? "Soumission…" : "Soumettre au Président"}
              </Button>
            </div>
          </form>
        </Card>

        {selectedMember && (
          <Card className="lg:sticky lg:top-[76px]">
            <CardHeader><CardTitle>Aperçu</CardTitle></CardHeader>
            <div className="p-5 text-center">
              <div className="flex justify-center"><Av name={selectedMember.name} id={selectedMember.id} size={52} /></div>
              <div className="mt-2.5 font-display text-[15px] font-bold text-ink">{selectedMember.name}</div>
              <div className="mt-0.5 text-[12px] text-ink-subtle">{selectedMember.role}</div>
              {typeInfo && (
                <div className="mt-3.5 rounded-md border border-danger-border bg-danger-soft px-3 py-2.5">
                  <div className="text-[12px] font-semibold text-danger">{typeInfo.type}</div>
                  <div className="mt-1 font-display text-[13px] font-bold text-danger">
                    {form.fine > 0 ? fmtCFA(form.fine) : "Pas d'amende"}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
      <div className="toast-wrap">{toasts.map((t) => <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>)}</div>
    </>
  );
}

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApi } from "@/hooks/useApi";
import { useToast } from "@/hooks/useToast";
import { fmtCFA } from "@/components/ui/index";
import { PageHeader, Card, CardHeader, CardTitle, InputField, Button } from "@/design-system";

export default function CotisationEdit() {
  const { id } = useParams();
  const api = useApi();
  const { toast, toasts } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const ff = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    api.getCotisationById(parseInt(id))
      .then((c) => setForm({ label: c.label, amount: c.amount, date_debut: c.date_debut, date_fin: c.date_fin }))
      .catch(() => navigate("../..", { relative: "path" }));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.label || !form.amount || !form.date_debut || !form.date_fin) {
      toast("Tous les champs sont requis", "error"); return;
    }
    if (new Date(form.date_fin) <= new Date(form.date_debut)) {
      toast("La date de fin doit être après la date de début", "error"); return;
    }
    setLoading(true);
    try {
      await api.updateCotisation(parseInt(id), { ...form, amount: parseFloat(form.amount) });
      toast("Cotisation mise à jour ✓");
      setTimeout(() => navigate(`../../show/${id}`, { relative: "path" }), 1000);
    } catch (err) { toast(err.message, "error"); } finally { setLoading(false); }
  };

  if (!form) return <div className="grid place-items-center py-20 text-sm text-ink-subtle">Chargement…</div>;

  const duree = form.date_debut && form.date_fin
    ? Math.max(0, Math.ceil((new Date(form.date_fin) - new Date(form.date_debut)) / 86400000))
    : null;

  return (
    <>
      <PageHeader title="Modifier la cotisation" onBack={() => navigate("../..", { relative: "path" })} />

      <Card className="max-w-xl">
        <CardHeader><CardTitle>Modification</CardTitle></CardHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
          <InputField label="Libellé" value={form.label} onChange={(e) => ff("label", e.target.value)} />
          <InputField label="Montant (FCFA)" type="number" min="0" value={form.amount} onChange={(e) => ff("amount", e.target.value)} />
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField label="Date de début" type="date" value={form.date_debut} onChange={(e) => ff("date_debut", e.target.value)} />
            <InputField label="Date de fin" type="date" value={form.date_fin} onChange={(e) => ff("date_fin", e.target.value)} />
          </div>
          {duree > 0 && (
            <div className="rounded-md bg-surface-2 px-3.5 py-2.5 text-[13px] text-ink-muted">
              Durée : <strong className="text-ink">{duree} jours</strong> · Montant cible :{" "}
              <strong className="text-ink">{fmtCFA(parseFloat(form.amount) || 0)}</strong>
            </div>
          )}
          <div className="rounded-md border border-warning-border bg-warning-soft px-3.5 py-3 text-[13px] text-ink">
            La modification s'applique uniquement aux futures opérations. Les paiements déjà enregistrés ne sont pas affectés.
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => navigate("../..", { relative: "path" })}>Annuler</Button>
            <Button type="submit" loading={loading} fullWidth>
              {loading ? "Enregistrement…" : "Enregistrer les modifications"}
            </Button>
          </div>
        </form>
      </Card>

      <div className="toast-wrap">{toasts.map((t) => <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>)}</div>
    </>
  );
}

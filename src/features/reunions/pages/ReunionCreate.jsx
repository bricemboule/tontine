import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "@/hooks/useApi";
import { useToast } from "@/hooks/useToast";
import { PageHeader, Card, CardHeader, CardTitle, CardSubtitle, InputField, Select, Button } from "@/design-system";

export default function ReunionCreate() {
  const api = useApi();
  const { toast, toasts } = useToast();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({ title: "", date: "", time: "15:00", location: "", beneficiary: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const ff = (k, v) => { setForm((p) => ({ ...p, [k]: v })); setErrors((p) => ({ ...p, [k]: "" })); };

  useEffect(() => {
    api.getMembers().then((m) => setMembers(m.filter((x) => x.status === "active"))).catch(() => {});
  }, [api]);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Le titre est requis";
    if (!form.date) e.date = "La date est requise";
    if (!form.location.trim()) e.location = "Le lieu est requis";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const m = await api.createMeeting(form);
      toast("Réunion planifiée — membres notifiés ✓");
      setTimeout(() => navigate(`../show/${m.id}`), 1000);
    } catch (err) { toast(err.message, "error"); } finally { setLoading(false); }
  };

  return (
    <>
      <PageHeader title="Planifier une réunion" onBack={() => navigate("..")} />

      <Card className="max-w-2xl">
        <CardHeader>
          <div>
            <CardTitle>Nouvelle réunion</CardTitle>
            <CardSubtitle>Les membres actifs seront notifiés par SMS et WhatsApp.</CardSubtitle>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
          <InputField label="Titre de la réunion" value={form.title} onChange={(e) => ff("title", e.target.value)} placeholder="ex : Réunion mensuelle — Mai 2026" error={errors.title} />
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField label="Date" type="date" value={form.date} onChange={(e) => ff("date", e.target.value)} error={errors.date} />
            <InputField label="Heure" type="time" value={form.time} onChange={(e) => ff("time", e.target.value)} />
          </div>
          <InputField label="Lieu" value={form.location} onChange={(e) => ff("location", e.target.value)} placeholder="Adresse, domicile du membre, salle…" error={errors.location} />
          <Select label="Bénéficiaire du tour (optionnel)" value={form.beneficiary} onChange={(e) => ff("beneficiary", e.target.value)}>
            <option value="">— Sélectionner un membre —</option>
            {members.map((m) => <option key={m.id} value={m.name}>{m.name}</option>)}
          </Select>

          {form.date && (
            <div className="rounded-md border border-info-border bg-info-soft px-3.5 py-3 text-[13px] text-ink">
              SMS + WhatsApp envoyés automatiquement à tous les membres actifs ({members.length} personnes).
            </div>
          )}

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => navigate("..")}>Annuler</Button>
            <Button type="submit" loading={loading} fullWidth>
              {loading ? "Création…" : "Planifier & notifier les membres"}
            </Button>
          </div>
        </form>
      </Card>

      <div className="toast-wrap">{toasts.map((t) => <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>)}</div>
    </>
  );
}

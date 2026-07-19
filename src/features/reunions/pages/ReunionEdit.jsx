import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApi } from "@/hooks/useApi";
import { useToast } from "@/hooks/useToast";
import { PageHeader, Card, CardHeader, CardTitle, InputField, Select, Button } from "@/design-system";

export default function ReunionEdit() {
  const { id } = useParams();
  const api = useApi();
  const { toast, toasts } = useToast();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const ff = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    api.getMeetings().then((list) => {
      const m = list.find((x) => x.id === parseInt(id));
      if (m) setForm({ title: m.title, date: m.date, time: m.time, location: m.location, beneficiary: m.beneficiary || "" });
      else navigate("..");
    }).catch(() => navigate(".."));
    api.getMembers().then((m) => setMembers(m.filter((x) => x.status === "active"))).catch(() => {});
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.date) { toast("Titre et date requis", "error"); return; }
    setLoading(true);
    try {
      await api.updateMeeting(parseInt(id), form);
      toast("Réunion modifiée ✓");
      setTimeout(() => navigate(`../show/${id}`), 1000);
    } catch (err) { toast(err.message, "error"); } finally { setLoading(false); }
  };

  if (!form) return <div className="grid place-items-center py-20 text-sm text-ink-subtle">Chargement…</div>;

  return (
    <>
      <PageHeader title="Modifier la réunion" onBack={() => navigate("..")} />

      <Card className="max-w-2xl">
        <CardHeader><CardTitle>Modifier les informations</CardTitle></CardHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
          <InputField label="Titre" value={form.title} onChange={(e) => ff("title", e.target.value)} />
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField label="Date" type="date" value={form.date} onChange={(e) => ff("date", e.target.value)} />
            <InputField label="Heure" type="time" value={form.time} onChange={(e) => ff("time", e.target.value)} />
          </div>
          <InputField label="Lieu" value={form.location} onChange={(e) => ff("location", e.target.value)} />
          <Select label="Bénéficiaire" value={form.beneficiary} onChange={(e) => ff("beneficiary", e.target.value)}>
            <option value="">— Sélectionner —</option>
            {members.map((m) => <option key={m.id} value={m.name}>{m.name}</option>)}
          </Select>
          <div className="rounded-md border border-warning-border bg-warning-soft px-3.5 py-3 text-[13px] text-ink">
            Une notification de modification sera envoyée aux membres.
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => navigate("..")}>Annuler</Button>
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

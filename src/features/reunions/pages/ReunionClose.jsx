import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fmtDate, fmtCFA } from "@/components/ui/index";
import { useApi } from "@/hooks/useApi";
import { useToast } from "@/hooks/useToast";
import { PageHeader, Card, CardHeader, CardTitle, CardSubtitle, InputField, Button } from "@/design-system";

export default function ReunionClose() {
  const { id } = useParams();
  const api = useApi();
  const { toast, toasts } = useToast();
  const navigate = useNavigate();
  const [meet, setMeet] = useState(null);
  const [form, setForm] = useState({ collected: "", attendees: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getMeetings().then((list) => {
      const m = list.find((x) => x.id === parseInt(id));
      if (m) setMeet(m); else navigate("..");
    }).catch(() => navigate(".."));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.collected || !form.attendees) { toast("Tous les champs sont requis", "error"); return; }
    setLoading(true);
    try {
      await api.closeMeeting(parseInt(id), parseFloat(form.collected), parseInt(form.attendees));
      toast("Réunion clôturée avec succès ✓");
      setTimeout(() => navigate(`../show/${id}`), 1000);
    } catch (err) { toast(err.message, "error"); } finally { setLoading(false); }
  };

  if (!meet) return <div className="grid place-items-center py-20 text-sm text-ink-subtle">Chargement…</div>;

  const byPresent = form.collected && form.attendees
    ? fmtCFA(parseFloat(form.collected) / parseInt(form.attendees))
    : null;

  return (
    <>
      <PageHeader title="Clôturer la réunion" onBack={() => navigate("..")} />

      <Card className="max-w-xl">
        <CardHeader>
          <div>
            <CardTitle>Enregistrement des résultats</CardTitle>
            <CardSubtitle>{fmtDate(meet.date)} — {meet.location}</CardSubtitle>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
          <InputField
            label="Montant total collecté (FCFA)"
            type="number"
            value={form.collected}
            onChange={(e) => setForm((p) => ({ ...p, collected: e.target.value }))}
            placeholder={`Objectif : ${fmtCFA((meet.total || 8) * 50000)}`}
          />
          <InputField
            label="Nombre de membres présents"
            type="number"
            min="0"
            value={form.attendees}
            onChange={(e) => setForm((p) => ({ ...p, attendees: e.target.value }))}
            placeholder={`sur ${meet.total || "?"} membres`}
          />

          {byPresent && (
            <div className="grid grid-cols-3 gap-3 rounded-md bg-surface-2 px-3.5 py-3">
              {[
                ["Collecté", fmtCFA(parseFloat(form.collected) || 0)],
                ["Présents", `${form.attendees} / ${meet.total || "?"}`],
                ["Par présent", byPresent],
              ].map(([l, v]) => (
                <div key={l} className="text-center">
                  <div className="mb-1 text-[9.5px] font-bold uppercase tracking-[0.08em] text-ink-subtle">{l}</div>
                  <div className="font-display text-[14px] font-bold text-ink tabular-nums">{v}</div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => navigate("..")}>Annuler</Button>
            <Button type="submit" loading={loading} fullWidth>
              {loading ? "Clôture…" : "Confirmer la clôture"}
            </Button>
          </div>
        </form>
      </Card>

      <div className="toast-wrap">{toasts.map((t) => <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>)}</div>
    </>
  );
}

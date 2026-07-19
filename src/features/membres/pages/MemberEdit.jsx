import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApi } from "@/hooks/useApi";
import { useToast } from "@/hooks/useToast";
import { PageHeader, Card, CardHeader, CardTitle, InputField, Select, Button } from "@/design-system";

const ROLES = [
  ["membre", "Membre"], ["tresorier", "Trésorier(e)"],
  ["secretaire", "Secrétaire"], ["censeur", "Censeur"],
];

export default function MemberEdit() {
  const { id } = useParams();
  const api = useApi();
  const { toast, toasts } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const ff = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    api.getMemberById(parseInt(id)).then((m) => {
      const parts = m.name.split(" ");
      setForm({ prenom: parts[0] || "", nom: parts.slice(1).join(" ") || "", phone: m.phone, email: m.email || "", role: m.role });
    }).catch(() => navigate(".."));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.prenom || !form.nom || !form.phone) { toast("Prénom, nom et téléphone requis", "error"); return; }
    setLoading(true);
    try {
      await api.updateMember(parseInt(id), {
        first_name: form.prenom, last_name: form.nom, phone: form.phone,
        email: form.email || null, role: form.role,
      });
      toast("Informations mises à jour ✓");
      setTimeout(() => navigate(`../show/${id}`), 1000);
    } catch (err) { toast(err.message, "error"); } finally { setLoading(false); }
  };

  if (!form) return <div className="grid place-items-center py-20 text-sm text-ink-subtle">Chargement…</div>;

  return (
    <>
      <PageHeader title="Modifier le membre" onBack={() => navigate("..")} />

      <Card className="max-w-2xl">
        <CardHeader><CardTitle>Informations du membre</CardTitle></CardHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField label="Prénom" value={form.prenom} onChange={(e) => ff("prenom", e.target.value)} />
            <InputField label="Nom" value={form.nom} onChange={(e) => ff("nom", e.target.value)} />
          </div>
          <InputField label="Téléphone" type="tel" value={form.phone} onChange={(e) => ff("phone", e.target.value)} />
          <InputField label="Email" type="email" value={form.email} onChange={(e) => ff("email", e.target.value)} />
          <Select label="Rôle" value={form.role} onChange={(e) => ff("role", e.target.value)}>
            {ROLES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </Select>
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

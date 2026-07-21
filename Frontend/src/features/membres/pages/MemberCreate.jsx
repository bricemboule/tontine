import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "@/hooks/useApi";
import { useToast } from "@/hooks/useToast";
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardSubtitle,
  InputField,
  Button,
  cn,
} from "@/design-system";

const ROLES = [
  ["membre", "Membre", "Participant standard"],
  ["tresorier", "Trésorier(e)", "Gestion financière"],
  ["secretaire", "Secrétaire", "Administration"],
  ["censeur", "Censeur", "Contrôle & discipline"],
];

const SectionLabel = ({ children }) => (
  <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-subtle">
    {children}
  </div>
);

export default function MemberCreate() {
  const api = useApi();
  const { toast, toasts } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    phone: "",
    email: "",
    role: "membre",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const ff = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.prenom.trim()) e.prenom = "Le prénom est requis";
    if (!form.nom.trim()) e.nom = "Le nom est requis";
    if (!form.phone.trim()) e.phone = "Le téléphone est requis";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      await api.addMember({
        first_name: form.prenom.trim(),
        last_name: form.nom.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        role: form.role,
      });
      toast("Membre soumis au Président ✓");
      setTimeout(() => navigate("..", { relative: "path" }), 1000);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Ajouter un membre"
        onBack={() => navigate("..", { relative: "path" })}
      />

      <Card className="max-w-3xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
          <SectionLabel>Identité</SectionLabel>
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField
              label="Prénom"
              value={form.prenom}
              onChange={(e) => ff("prenom", e.target.value)}
              placeholder="Prénom"
              error={errors.prenom}
            />
            <InputField
              label="Nom"
              value={form.nom}
              onChange={(e) => ff("nom", e.target.value)}
              placeholder="Nom de famille"
              error={errors.nom}
            />
          </div>

          <SectionLabel>Contact</SectionLabel>
          <InputField
            label="Téléphone"
            type="tel"
            value={form.phone}
            onChange={(e) => ff("phone", e.target.value)}
            placeholder="+237 6XX XXX XXX"
            error={errors.phone}
          />
          <InputField
            label="Email (optionnel)"
            type="email"
            value={form.email}
            onChange={(e) => ff("email", e.target.value)}
            placeholder="email@exemple.com"
          />

          <SectionLabel>Rôle</SectionLabel>
          <div className="grid gap-2 sm:grid-cols-2">
            {ROLES.map(([v, l, sub]) => (
              <label
                key={v}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2.5 transition",
                  form.role === v
                    ? "border-primary-500 bg-[var(--primary-soft)]"
                    : "border-line bg-surface-2 hover:border-line",
                )}
              >
                <input
                  type="radio"
                  name="role"
                  value={v}
                  checked={form.role === v}
                  onChange={() => ff("role", v)}
                  className="h-4 w-4 accent-primary-600"
                />
                <div>
                  <div className="text-[13px] font-semibold text-ink">{l}</div>
                  <div className="text-[11px] text-ink-subtle">{sub}</div>
                </div>
              </label>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("..", { relative: "path" })}
            >
              Annuler
            </Button>
            <Button type="submit" loading={loading} fullWidth>
              {loading ? "Envoi…" : "Soumettre la demande d'adhésion"}
            </Button>
          </div>
        </form>
      </Card>

      <div className="toast-wrap">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            {t.msg}
          </div>
        ))}
      </div>
    </>
  );
}

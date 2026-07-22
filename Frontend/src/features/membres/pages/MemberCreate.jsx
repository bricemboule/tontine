import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound, Copy, Check, X } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { useToast } from "@/hooks/useToast";
import {
  PageHeader,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  CardSubtitle,
  InputField,
  Button,
  cn,
} from "@/design-system";

const ROLES = [
  ["membre", "Membre", "Participant standard"],
  ["president", "Président(e)", "Dirige le bureau, valide les membres"],
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
  const [created, setCreated] = useState(null); // { name, role, email, password }
  const [copied, setCopied] = useState(false);
  const ff = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: "" }));
  };

  const resetForm = () => {
    setForm({ prenom: "", nom: "", phone: "", email: "", role: "membre" });
    setErrors({});
    setCreated(null);
    setCopied(false);
  };

  const copyCreds = async () => {
    if (!created) return;
    const text = `Email : ${created.email}\nMot de passe : ${created.password}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast("Copie impossible — sélectionnez le texte manuellement", "error");
    }
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
      const res = await api.addMember({
        first_name: form.prenom.trim(),
        last_name: form.nom.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        role: form.role,
      });
      const label = ROLES.find(([v]) => v === form.role)?.[1] || "Membre";
      toast(`${label} « ${res?.name || ""} » créé ✓`);
      if (res?.temporary_password) {
        // Nouveau compte : on affiche les identifiants (sinon ils sont perdus).
        setCreated({
          name: res.name,
          role: label,
          email: res.email || form.email.trim(),
          password: res.temporary_password,
        });
        setCopied(false);
      } else {
        // Compte déjà existant (rattaché) : rien à transmettre → retour liste.
        setTimeout(() => navigate("..", { relative: "path" }), 800);
      }
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

      {created ? (
        <Card className="max-w-3xl border-success-border">
          <CardBody className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-success-soft text-success">
                  <KeyRound size={17} />
                </span>
                <div>
                  <div className="text-[14px] font-bold text-ink">
                    {created.role} « {created.name} » créé
                  </div>
                  <div className="text-[12px] text-ink-muted">
                    Transmettez ces identifiants à la personne — le mot de passe
                    ne sera plus affiché. Le membre doit d'abord être validé pour
                    pouvoir se connecter.
                  </div>
                </div>
              </div>
              <button
                type="button"
                aria-label="Fermer"
                onClick={() => navigate("..", { relative: "path" })}
                className="grid h-7 w-7 place-items-center rounded-md text-ink-subtle hover:bg-surface-2 hover:text-ink"
              >
                <X size={16} />
              </button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-md bg-surface-2 px-3.5 py-2.5">
                <div className="text-[10px] font-bold uppercase tracking-wide text-ink-subtle">
                  Email de connexion
                </div>
                <div className="font-mono text-[13px] font-semibold text-ink">
                  {created.email}
                </div>
              </div>
              <div className="rounded-md bg-surface-2 px-3.5 py-2.5">
                <div className="text-[10px] font-bold uppercase tracking-wide text-ink-subtle">
                  Mot de passe temporaire
                </div>
                <div className="font-mono text-[13px] font-semibold text-ink">
                  {created.password}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                iconLeft={copied ? <Check size={15} /> : <Copy size={15} />}
                onClick={copyCreds}
              >
                {copied ? "Copié !" : "Copier les identifiants"}
              </Button>
              <Button variant="outline" size="sm" onClick={resetForm}>
                Ajouter un autre membre
              </Button>
              <Button size="sm" onClick={() => navigate("..", { relative: "path" })}>
                Retour à la liste
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : (
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
      )}

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

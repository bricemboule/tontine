import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "@/hooks/useApi";
import { useToast } from "@/hooks/useToast";
import { fmtCFA } from "@/components/ui/index";
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardSubtitle,
  CardBody,
  InputField,
  Button,
} from "@/design-system";

export default function CotisationCreate() {
  const api = useApi();
  const { toast, toasts } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    label: "",
    amount: "",
    date_debut: "",
    date_fin: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const ff = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: "" }));
  };

  const duree =
    form.date_debut && form.date_fin
      ? Math.max(
          0,
          Math.ceil(
            (new Date(form.date_fin) - new Date(form.date_debut)) / 86400000,
          ),
        )
      : null;

  const validate = () => {
    const e = {};
    if (!form.label.trim()) e.label = "Le libellé est requis";
    if (!form.amount) e.amount = "Le montant est requis";
    if (!form.date_debut) e.date_debut = "La date de début est requise";
    if (!form.date_fin) e.date_fin = "La date de fin est requise";
    if (
      form.date_debut &&
      form.date_fin &&
      new Date(form.date_fin) <= new Date(form.date_debut)
    )
      e.date_fin = "La date de fin doit être après la date de début";
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
      const c = await api.createCotisation({
        ...form,
        amount: parseFloat(form.amount),
      });
      toast(`Cotisation « ${form.label} » créée ✓`);
      setTimeout(() => navigate("..", { relative: "path" }), 1000);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const recap = [
    ["Libellé", form.label || "—"],
    ["Montant cible", form.amount ? fmtCFA(parseFloat(form.amount)) : "—"],
    ["Début", form.date_debut || "—"],
    ["Fin", form.date_fin || "—"],
    ["Durée", duree !== null ? `${duree} jours` : "—"],
    ["Statut à l'ouverture", "Ouverte"],
  ];

  return (
    <>
      <PageHeader
        title="Créer une cotisation"
        subtitle="Nouvelle période de cotisation"
        onBack={() => navigate("..", { relative: "path" })}
      />

      <div className="grid items-start gap-4 lg:grid-cols-[1fr_300px]">
        <Card>
          <CardHeader></CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <InputField
                label="Libellé"
                value={form.label}
                onChange={(e) => ff("label", e.target.value)}
                placeholder="ex : Cotisation mensuelle — Mai 2026"
                error={errors.label}
              />
              <InputField
                label="Montant par membre (FCFA)"
                type="number"
                min="0"
                value={form.amount}
                onChange={(e) => ff("amount", e.target.value)}
                placeholder="50000"
                error={errors.amount}
              />

              <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.1em] text-ink-subtle">
                Période de cotisation
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <InputField
                  label="Date de début"
                  type="date"
                  value={form.date_debut}
                  onChange={(e) => ff("date_debut", e.target.value)}
                  error={errors.date_debut}
                />
                <InputField
                  label="Date de fin"
                  type="date"
                  value={form.date_fin}
                  onChange={(e) => ff("date_fin", e.target.value)}
                  error={errors.date_fin}
                />
              </div>

              <div className="mt-1 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("..", { relative: "path" })}
                >
                  Annuler
                </Button>
                <Button type="submit" loading={loading} fullWidth>
                  {loading ? "Création…" : "Créer la cotisation"}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>

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

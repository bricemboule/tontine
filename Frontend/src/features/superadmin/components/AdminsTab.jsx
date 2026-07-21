import { useEffect, useState } from "react";
import { Plus, Users, KeyRound, Copy, Check, X } from "lucide-react";
import {
  PageHeader,
  Card,
  CardBody,
  DataTable,
  InputField,
  StatusBadge,
  Button,
} from "@/design-system";

export default function AdminsTab({ api, toast, onAdminsChange }) {
  const [admins, setAdmins] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });
  const [created, setCreated] = useState(null); // { name, email, password }
  const [copied, setCopied] = useState(false);
  const ff = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: "" }));
  };

  const loadAdmins = async () => {
    const rows = await api.getAdmins();
    setAdmins(rows);
    onAdminsChange?.(rows);
  };

  useEffect(() => {
    loadAdmins().catch(() => {});
  }, []);

  const validate = () => {
    const next = {};
    if (!form.first_name.trim()) next.first_name = "Le prénom est requis";
    if (!form.last_name.trim()) next.last_name = "Le nom est requis";
    if (!form.email.trim()) next.email = "L'email est requis";
    if (!form.phone.trim()) next.phone = "Le téléphone est requis";
    return next;
  };

  const resetForm = () => {
    setShowForm(false);
    setErrors({});
    setForm({ first_name: "", last_name: "", email: "", phone: "" });
  };

  const doCreate = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      const email = form.email.trim();
      const admin = await api.createAdmin({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email,
        phone: form.phone.trim(),
      });
      toast(`Administrateur « ${admin.name} » créé ✓`);
      setCreated({
        name: admin.name,
        email,
        password: admin.temporary_password,
      });
      setCopied(false);
      await loadAdmins();
      resetForm();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setLoading(false);
    }
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

  const columns = [
    {
      key: "name",
      header: "Administrateur",
      width: "26%",
      render: (a) => (
        <div>
          <div className="font-semibold text-ink">{a.name}</div>
          <div className="text-[10.5px] text-ink-subtle">
            Rôle : administrateur
          </div>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (a) => <span className="text-ink-muted">{a.email}</span>,
    },
    {
      key: "phone",
      header: "Téléphone",
      render: (a) => <span className="text-ink-muted">{a.phone}</span>,
    },
    {
      key: "available",
      header: "Disponibilité",
      render: (a) => (
        <StatusBadge
          status={a.available ? "active" : "pending"}
          label={a.available ? "Disponible" : "Occupé"}
        />
      ),
    },
    {
      key: "tontine",
      header: "Tontine",
      render: (a) => (
        <span className="text-ink-subtle">
          {a.assigned_tontine?.name || "Non attribué"}
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Administrateurs"
        subtitle="Créez d'abord les comptes admin, ils pourront ensuite être attribués aux tontines."
        actions={
          !showForm && (
            <Button
              iconLeft={<Plus size={17} strokeWidth={2.2} />}
              onClick={() => setShowForm(true)}
            >
              Nouvel administrateur
            </Button>
          )
        }
      />

      {!showForm && created && (
        <Card className="mb-4 border-success-border">
          <CardBody className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-success-soft text-success">
                  <KeyRound size={17} />
                </span>
                <div>
                  <div className="text-[14px] font-bold text-ink">
                    Compte de {created.name} créé
                  </div>
                  <div className="text-[12px] text-ink-muted">
                    Transmets ces identifiants à l'administrateur — le mot de
                    passe ne sera plus affiché.
                  </div>
                </div>
              </div>
              <button
                type="button"
                aria-label="Fermer"
                onClick={() => setCreated(null)}
                className="grid h-7 w-7 place-items-center rounded-md text-ink-subtle hover:bg-surface-2 hover:text-ink"
              >
                <X size={16} />
              </button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-md bg-surface-2 px-3.5 py-2.5">
                <div className="text-[10px] font-bold uppercase tracking-wide text-ink-subtle">
                  Email
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
            <div>
              <Button
                variant="outline"
                size="sm"
                iconLeft={copied ? <Check size={15} /> : <Copy size={15} />}
                onClick={copyCreds}
              >
                {copied ? "Copié !" : "Copier les identifiants"}
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {showForm ? (
        <Card>
          <CardBody className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                label="Prénom"
                value={form.first_name}
                onChange={(e) => ff("first_name", e.target.value)}
                placeholder="Marie"
                error={errors.first_name}
              />
              <InputField
                label="Nom"
                value={form.last_name}
                onChange={(e) => ff("last_name", e.target.value)}
                placeholder="Ngono"
                error={errors.last_name}
              />
            </div>
            <InputField
              label="Adresse email"
              type="email"
              value={form.email}
              onChange={(e) => ff("email", e.target.value)}
              placeholder="admin@tontine.cm"
              error={errors.email}
            />
            <InputField
              label="Téléphone"
              value={form.phone}
              onChange={(e) => ff("phone", e.target.value)}
              placeholder="+237 6XX XXX XXX"
              error={errors.phone}
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={resetForm}>
                Annuler
              </Button>
              <Button loading={loading} fullWidth onClick={doCreate}>
                {loading ? "Création…" : "Créer l'administrateur"}
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : (
        <DataTable
          columns={columns}
          data={admins}
          rowKey={(a) => a.id}
          empty={{
            icon: Users,
            title: "Aucun administrateur",
            message: "Aucun administrateur n'a encore été créé.",
          }}
        />
      )}
    </>
  );
}

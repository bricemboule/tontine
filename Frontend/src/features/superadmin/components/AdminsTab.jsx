import { useEffect, useState } from "react";
import { Plus, Users } from "lucide-react";
import { PageHeader, Card, CardBody, DataTable, InputField, StatusBadge, Button } from "@/design-system";

export default function AdminsTab({ api, toast, onAdminsChange }) {
  const [admins, setAdmins] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone: "" });
  const ff = (k, v) => { setForm((p) => ({ ...p, [k]: v })); setErrors((p) => ({ ...p, [k]: "" })); };

  const loadAdmins = async () => {
    const rows = await api.getAdmins();
    setAdmins(rows);
    onAdminsChange?.(rows);
  };

  useEffect(() => { loadAdmins().catch(() => {}); }, []);

  const validate = () => {
    const next = {};
    if (!form.first_name.trim()) next.first_name = "Le prénom est requis";
    if (!form.last_name.trim()) next.last_name = "Le nom est requis";
    if (!form.email.trim()) next.email = "L'email est requis";
    if (!form.phone.trim()) next.phone = "Le téléphone est requis";
    return next;
  };

  const resetForm = () => { setShowForm(false); setErrors({}); setForm({ first_name: "", last_name: "", email: "", phone: "" }); };

  const doCreate = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) { setErrors(validationErrors); return; }
    setLoading(true);
    try {
      const admin = await api.createAdmin({
        first_name: form.first_name.trim(), last_name: form.last_name.trim(),
        email: form.email.trim(), phone: form.phone.trim(),
      });
      toast(`Administrateur « ${admin.name} » créé ✓`);
      await loadAdmins();
      resetForm();
    } catch (e) { toast(e.message, "error"); } finally { setLoading(false); }
  };

  const columns = [
    {
      key: "name", header: "Administrateur", width: "26%",
      render: (a) => (
        <div>
          <div className="font-semibold text-ink">{a.name}</div>
          <div className="text-[10.5px] text-ink-subtle">Rôle : administrateur</div>
        </div>
      ),
    },
    { key: "email", header: "Email", render: (a) => <span className="text-ink-muted">{a.email}</span> },
    { key: "phone", header: "Téléphone", render: (a) => <span className="text-ink-muted">{a.phone}</span> },
    { key: "available", header: "Disponibilité", render: (a) => <StatusBadge status={a.available ? "active" : "pending"} label={a.available ? "Disponible" : "Occupé"} /> },
    { key: "tontine", header: "Tontine", render: (a) => <span className="text-ink-subtle">{a.assigned_tontine?.name || "Non attribué"}</span> },
  ];

  return (
    <>
      <PageHeader
        title="Administrateurs"
        subtitle="Créez d'abord les comptes admin, ils pourront ensuite être attribués aux tontines."
        actions={!showForm && <Button iconLeft={<Plus size={17} strokeWidth={2.2} />} onClick={() => setShowForm(true)}>Nouvel administrateur</Button>}
      />

      {showForm ? (
        <Card>
          <CardBody className="flex flex-col gap-4">
            <div className="rounded-md border border-info-border bg-info-soft px-3.5 py-3 text-[13px] text-ink">
              Le compte sera créé avec le rôle <strong>admin</strong>. Il pourra ensuite être sélectionné lors de la création d'une tontine.
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField label="Prénom" value={form.first_name} onChange={(e) => ff("first_name", e.target.value)} placeholder="Marie" error={errors.first_name} />
              <InputField label="Nom" value={form.last_name} onChange={(e) => ff("last_name", e.target.value)} placeholder="Ngono" error={errors.last_name} />
            </div>
            <InputField label="Adresse email" type="email" value={form.email} onChange={(e) => ff("email", e.target.value)} placeholder="admin@tontine.cm" error={errors.email} />
            <InputField label="Téléphone" value={form.phone} onChange={(e) => ff("phone", e.target.value)} placeholder="+237 6XX XXX XXX" error={errors.phone} />
            <div className="flex gap-2">
              <Button variant="outline" onClick={resetForm}>Annuler</Button>
              <Button loading={loading} fullWidth onClick={doCreate}>{loading ? "Création…" : "Créer l'administrateur"}</Button>
            </div>
          </CardBody>
        </Card>
      ) : (
        <DataTable
          columns={columns}
          data={admins}
          rowKey={(a) => a.id}
          empty={{ icon: Users, title: "Aucun administrateur", message: "Aucun administrateur n'a encore été créé." }}
        />
      )}
    </>
  );
}

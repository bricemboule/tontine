import { useEffect, useState } from "react";
import { Plus, Building2 } from "lucide-react";
import { PageHeader, Card, CardBody, InputField, Button, StatusBadge, EmptyState } from "@/design-system";

export function OrganizationsPage({ api, toast }) {
  const [rows, setRows] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", city: "", country: "Cameroun", address: "" });
  const ff = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const load = () => api.getOrganizations().then(setRows).catch(() => {});
  useEffect(() => { load(); }, []);

  const create = async () => {
    const organization = await api.createOrganization(form);
    toast?.(`Organisation « ${organization.name} » créée`);
    setShowForm(false);
    setForm({ name: "", phone: "", email: "", city: "", country: "Cameroun", address: "" });
    load();
  };

  const setStatus = async (id, status) => {
    await api.updateOrganizationStatus(id, status);
    toast?.(status === "suspended" ? "Organisation suspendue" : "Organisation activée");
    load();
  };

  return (
    <>
      <PageHeader
        title="Organisations"
        subtitle="Espaces clients isolés par organisation"
        actions={
          <Button iconLeft={<Plus size={17} strokeWidth={2.2} />} onClick={() => setShowForm((p) => !p)}>
            {showForm ? "Fermer" : "Organisation"}
          </Button>
        }
      />

      {showForm && (
        <Card className="mb-4">
          <CardBody>
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField label="Nom" value={form.name} onChange={(e) => ff("name", e.target.value)} />
              <InputField label="Téléphone" value={form.phone} onChange={(e) => ff("phone", e.target.value)} />
              <InputField label="Email" type="email" value={form.email} onChange={(e) => ff("email", e.target.value)} />
              <InputField label="Ville" value={form.city} onChange={(e) => ff("city", e.target.value)} />
            </div>
            <div className="mt-4">
              <InputField label="Adresse" value={form.address} onChange={(e) => ff("address", e.target.value)} />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
              <Button disabled={!form.name.trim()} onClick={create}>Créer</Button>
            </div>
          </CardBody>
        </Card>
      )}

      <Card>
        {rows.length === 0 ? (
          <EmptyState icon={Building2} title="Aucune organisation" message="Créez une première organisation cliente." />
        ) : (
          rows.map((org) => (
            <div key={org.id} className="flex flex-wrap items-center gap-4 border-b border-line-soft px-5 py-3 last:border-0">
              <div className="min-w-[160px] flex-1">
                <div className="text-[13px] font-semibold text-ink">{org.name}</div>
                <div className="text-[11.5px] text-ink-subtle">{org.city || "—"} · {org.email || "—"} · Plan {org.plan_name || "—"}</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-wide text-ink-subtle">Tontines</div>
                <div className="font-display text-[14px] font-bold text-ink">{org.tontines_count || 0}</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-wide text-ink-subtle">Membres</div>
                <div className="font-display text-[14px] font-bold text-ink">{org.members_count || 0}</div>
              </div>
              <StatusBadge status={org.status} />
              <Button variant="outline" size="sm" onClick={() => setStatus(org.id, org.status === "active" ? "suspended" : "active")}>
                {org.status === "active" ? "Suspendre" : "Activer"}
              </Button>
            </div>
          ))
        )}
      </Card>
    </>
  );
}

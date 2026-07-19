import { useEffect, useState } from "react";
import { Plus, Trash2, Building2, UserPlus } from "lucide-react";
import { fmtDate } from "@/components/ui/index";
import { PageHeader, Card, CardBody, DataTable, InputField, Select, StatusBadge, Button } from "@/design-system";
import { getAdminLabel, getMembersCount, getSchemaLabel, slugify } from "../helpers";

export default function TontinesTab({ api, toast, onTontinesChange, onOpenAdmins }) {
  const [tontines, setTontines] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", admin_user_id: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const ff = (k, v) => { setForm((p) => ({ ...p, [k]: v })); setErrors((p) => ({ ...p, [k]: "" })); };

  const loadData = async () => {
    const [tontineRows, adminRows] = await Promise.all([api.getTontines(), api.getAvailableAdmins()]);
    setTontines(tontineRows);
    onTontinesChange?.(tontineRows);
    setAdmins(adminRows.filter((admin) => admin.available));
  };

  useEffect(() => { loadData().catch(() => {}); }, []);

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Le nom de la tontine est requis";
    if (!form.admin_user_id) next.admin_user_id = "Sélectionnez un administrateur";
    return next;
  };

  const doCreate = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) { setErrors(validationErrors); return; }
    setLoading(true);
    try {
      const payload = { name: form.name.trim(), admin_user_id: parseInt(form.admin_user_id, 10) };
      await api.createTontine(payload);
      toast(`Tontine « ${payload.name} » créée ✓`);
      await loadData();
      setShowForm(false); setErrors({}); setForm({ name: "", admin_user_id: "" });
    } catch (e) { toast(e.message, "error"); } finally { setLoading(false); }
  };

  const doDelete = async (id) => {
    if (!confirm("Supprimer cette tontine ? Action irréversible.")) return;
    await api.deleteTontine(id);
    await loadData();
    toast("Tontine supprimée", "warning");
  };

  const columns = [
    {
      key: "name", header: "Tontine", width: "26%",
      render: (t) => (
        <div>
          <div className="font-semibold text-ink">{t.name}</div>
          <div className="text-[10.5px] text-ink-subtle">Créée le {t.created_at || t.created ? fmtDate(t.created_at || t.created) : "—"}</div>
        </div>
      ),
    },
    { key: "admin", header: "Administrateur", render: (t) => <span className="text-ink-muted">{getAdminLabel(t)}</span> },
    { key: "schema", header: "Schéma", render: (t) => <span className="font-display text-[12.5px] font-bold text-primary-600">{getSchemaLabel(t)}</span> },
    { key: "members", header: "Membres", align: "right", render: (t) => <span className="font-display font-bold">{getMembersCount(t)}</span> },
    { key: "status", header: "Statut", render: (t) => <StatusBadge status={t.status} /> },
    {
      key: "actions", header: "", align: "right",
      render: (t) => (
        <Button variant="ghost" size="xs" iconOnly aria-label="Supprimer" onClick={(e) => { e.stopPropagation(); doDelete(t.id); }}>
          <Trash2 size={14} className="text-danger" />
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Tontines"
        subtitle={`${tontines.length} tontine(s)`}
        actions={
          <>
            <Button variant="outline" iconLeft={<UserPlus size={16} />} onClick={onOpenAdmins}>Créer un admin</Button>
            {!showForm && <Button iconLeft={<Plus size={17} strokeWidth={2.2} />} onClick={() => setShowForm(true)}>Nouvelle tontine</Button>}
          </>
        }
      />

      {showForm ? (
        <Card>
          <CardBody className="flex flex-col gap-4">
            <div className="rounded-md border border-info-border bg-info-soft px-3.5 py-3 text-[13px] text-ink">
              À la création, vous renseignez uniquement le nom et l'administrateur responsable. Le reste de la configuration sera fait dans l'espace admin de la tontine.
            </div>

            <InputField label="Nom de la tontine" value={form.name} onChange={(e) => ff("name", e.target.value)} placeholder="ex : Tontine Bami" error={errors.name} />
            {form.name.trim() && (
              <div className="rounded-md bg-surface-2 px-3.5 py-2.5">
                <div className="text-[10px] font-bold uppercase tracking-wide text-ink-subtle">Schéma généré automatiquement</div>
                <div className="mt-0.5 font-display text-[13px] font-bold text-primary-600">tontine_{slugify(form.name)}</div>
              </div>
            )}

            {admins.length === 0 ? (
              <div className="rounded-md border border-line bg-surface-2 p-4">
                <div className="text-[13px] font-bold text-ink">Aucun administrateur disponible</div>
                <div className="mt-1 text-[11.5px] text-ink-subtle">Chaque administrateur ne peut gérer qu'une seule tontine. Libérez-en un ou créez un nouveau compte admin.</div>
                <Button className="mt-3" size="sm" onClick={onOpenAdmins}>Créer un administrateur</Button>
              </div>
            ) : (
              <Select label="Administrateur" value={form.admin_user_id} onChange={(e) => ff("admin_user_id", e.target.value)} error={errors.admin_user_id}>
                <option value="">Sélectionner un administrateur</option>
                {admins.map((admin) => <option key={admin.id} value={admin.id}>{admin.name} · {admin.email} · {admin.phone}</option>)}
              </Select>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
              <Button disabled={loading || admins.length === 0} loading={loading} fullWidth onClick={doCreate}>
                {loading ? "Création…" : "Créer la tontine"}
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : (
        <DataTable
          columns={columns}
          data={tontines}
          rowKey={(t) => t.id}
          empty={{ icon: Building2, title: "Aucune tontine", message: "Aucune tontine créée pour le moment." }}
        />
      )}
    </>
  );
}

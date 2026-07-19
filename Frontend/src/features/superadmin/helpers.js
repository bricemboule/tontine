export function slugify(name) {
  return name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
}

export function getAdminLabel(tontine) {
  return tontine?.admin?.name || tontine?.admin_name || tontine?.admin || "Non attribué";
}

export function getSchemaLabel(tontine) {
  return tontine?.schema_name || tontine?.schema || "—";
}

export function getMembersCount(tontine) {
  return tontine?.members_count ?? tontine?.members ?? 0;
}

export const SUPERADMIN_NAV = [
  { id: "dashboard", label: "Vue d'ensemble", icon: "◈" },
  { id: "admins", label: "Administrateurs", icon: "◉" },
  { id: "tontines", label: "Tontines", icon: "⬡" },
  { id: "subscriptions", label: "Abonnements", icon: "▤" },
  { id: "audit", label: "Journal d'audit", icon: "≡" },
  { id: "settings", label: "Paramètres", icon: "⚙" },
];

export const SUPERADMIN_CSS = `
.sa-list-head,.sa-list-row{
  display:grid;
  grid-template-columns:1.35fr 1.1fr 1fr 90px 110px 56px;
  gap:12px;
  align-items:center;
}
.sa-list-head{
  padding:10px 16px;
  background:linear-gradient(180deg,var(--surf2),#eef3fb);
  border-bottom:1px solid var(--b);
}
.sa-list-row{
  padding:14px 16px;
  border-bottom:1px solid var(--b);
}
.sa-list-row:last-child{border-bottom:none}
.sa-form{
  padding:20px 20px 24px;
}
.sa-stack{display:grid;gap:16px}
.sa-kicker{
  font-family:var(--fd);
  font-size:11px;
  font-weight:700;
  text-transform:uppercase;
  letter-spacing:.1em;
  color:var(--t3);
  margin:0 0 12px;
}
.sa-preview{
  margin-top:10px;
  padding:10px 12px;
  border:1px solid var(--blbd);
  border-radius:var(--rs);
  background:linear-gradient(180deg,#f6f9ff,#edf4ff);
}
.sa-preview-label{
  font-size:10px;
  font-weight:700;
  text-transform:uppercase;
  letter-spacing:.08em;
  color:var(--t3);
}
.sa-preview-value{
  margin-top:4px;
  font-family:var(--fd);
  font-size:13px;
  font-weight:800;
  color:var(--blue);
}
.sa-admin-grid{
  display:grid;
  gap:10px;
}
.sa-admin-card{
  width:100%;
  text-align:left;
  padding:14px 15px;
  border-radius:12px;
  border:1.5px solid var(--b);
  background:var(--surf2);
  transition:all .14s;
}
.sa-admin-card:hover{transform:translateY(-1px);border-color:var(--blbd);background:#f8fbff}
.sa-admin-card.on{
  border-color:var(--blue);
  background:linear-gradient(180deg,var(--blbg),#f3f8ff);
  box-shadow:0 8px 20px rgba(29,110,245,.08);
}
.sa-admin-top{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:10px;
}
.sa-admin-name{font-size:13.5px;font-weight:700;color:var(--t)}
.sa-admin-meta{margin-top:4px;font-size:11.5px;color:var(--t3);line-height:1.55}
.sa-admin-empty{
  border:1px dashed var(--b2);
  border-radius:12px;
  padding:18px;
  background:var(--surf2);
}
@media (max-width: 980px){
  .sa-list-head{display:none}
  .sa-list-row{
    grid-template-columns:1fr;
    gap:8px;
  }
}
`;

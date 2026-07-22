import { Search } from "lucide-react";

export function fmtCFA(value) {
  return `${new Intl.NumberFormat("fr-FR").format(Number(value || 0))} FCFA`;
}

export function fmtDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("fr-FR");
}

const STATUS_META = {
  active: ["Actif", ""],
  paid: ["Payé", ""],
  paye: ["Payé", ""],
  validated: ["Validé", ""],
  valide: ["Validé", ""],
  confirmed: ["Confirmé", ""],
  completed: ["Terminé", ""],
  approved: ["Approuvé", ""],
  pending: ["En attente", "warn"],
  scheduled: ["Planifiée", "warn"],
  upcoming: ["À venir", "warn"],
  draft: ["Brouillon", "warn"],
  partial: ["Partiel", "warn"],
  late: ["En retard", "bad"],
  overdue: ["En retard", "bad"],
  rejected: ["Rejeté", "bad"],
  excluded: ["Exclu", "bad"],
  cancelled: ["Annulé", "bad"],
  canceled: ["Annulé", "bad"],
  suspended: ["Suspendu", "bad"],
};

export function StatusPill({ status, label }) {
  const meta = STATUS_META[String(status || "").toLowerCase()];
  const cls = meta ? meta[1] : "";
  return <span className={`actor-status ${cls}`}>{label || (meta ? meta[0] : status || "—")}</span>;
}

export function EmptyState({ children = "Aucune donnée pour le moment." }) {
  return <div className="actor-empty">{children}</div>;
}

/* Blocs partagés des tableaux de bord — branchés sur les tokens du
   design system (indigo unique, dark-ready). L'ancien paramètre `tone`
   (arc-en-ciel par rôle) est conservé pour compat mais n'est plus utilisé. */
export const ACTOR_DASHBOARD_CSS = `
.actor-board{display:grid;gap:18px}
.actor-hero{display:flex;align-items:flex-start;justify-content:space-between;gap:18px}
.actor-greet h2{font-family:var(--font-display);font-size:22px;line-height:1.1;font-weight:800;letter-spacing:-.01em;color:var(--text)}
.actor-greet p{margin-top:6px;color:var(--text-muted);font-size:12.5px}
.actor-search{display:flex;align-items:center;gap:8px;min-width:210px;height:40px;padding:0 12px;border:1px solid var(--border);border-radius:10px;background:var(--surface);color:var(--text-subtle);font-size:13px}
.actor-kpis{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
.actor-kpis.k6{grid-template-columns:repeat(3,minmax(0,1fr))}
.actor-card,.actor-panel{background:var(--surface);border:1px solid var(--border);border-radius:14px;box-shadow:var(--shadow-sm)}
.actor-card{display:flex;gap:13px;align-items:center;min-height:84px;padding:16px}
.actor-ico{width:42px;height:42px;display:grid;place-items:center;border-radius:11px;background:var(--primary-soft);color:var(--primary-strong);font-size:18px;font-weight:800}
.actor-ico svg{width:20px;height:20px}
.actor-metric{font-family:var(--font-display);font-size:23px;line-height:1;font-weight:800;letter-spacing:-.02em;color:var(--text);font-variant-numeric:tabular-nums}
.actor-label{margin-top:6px;font-size:11.5px;color:var(--text-muted)}
.actor-delta{margin-top:6px;font-size:11px;font-weight:700;color:var(--success)}
.actor-delta.bad{color:var(--danger)}
.actor-grid{display:grid;grid-template-columns:1.45fr .9fr;gap:16px}
.actor-grid.equal{grid-template-columns:1fr 1fr}
.actor-panel{overflow:hidden}
.actor-panel-hd{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px 16px;border-bottom:1px solid var(--border-soft)}
.actor-panel-title{font-family:var(--font-display);font-size:15px;font-weight:700;color:var(--text)}
.actor-panel-sub{font-size:11.5px;color:var(--text-subtle)}
.actor-panel-body{padding:15px 16px}
.actor-table{width:100%;border-collapse:collapse}
.actor-table th{padding:9px 6px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.06em;font-weight:700;color:var(--text-subtle);border-bottom:1px solid var(--border-soft)}
.actor-table td{padding:11px 6px;border-bottom:1px solid var(--border-soft);font-size:13px;color:var(--text)}
.actor-table tr:last-child td{border-bottom:0}
.actor-status{display:inline-flex;align-items:center;gap:5px;min-height:22px;padding:0 9px;border-radius:999px;background:var(--success-soft);color:var(--success);font-size:11px;font-weight:600;border:1px solid var(--success-border)}
.actor-status.warn{background:var(--warning-soft);color:var(--warning);border-color:var(--warning-border)}
.actor-status.bad{background:var(--danger-soft);color:var(--danger);border-color:var(--danger-border)}
.actor-actions{display:grid;gap:10px}
.actor-action{display:flex;align-items:center;gap:9px;min-height:44px;padding:0 14px;border:0;border-radius:10px;background:var(--primary);color:#fff;font-size:13px;font-weight:600;text-align:left;cursor:pointer;transition:background .15s}
.actor-action:hover{background:var(--primary-strong)}
.actor-list{display:grid;gap:9px}
.actor-line{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 0;border-bottom:1px solid var(--border-soft)}
.actor-line:last-child{border-bottom:0}
.actor-line-main{font-size:13px;font-weight:600;color:var(--text)}
.actor-line-sub{margin-top:2px;font-size:11.5px;color:var(--text-subtle)}
.actor-pill{display:inline-flex;align-items:center;justify-content:center;min-height:22px;padding:0 9px;border-radius:999px;background:var(--primary-soft);color:var(--primary-strong);font-size:11px;font-weight:600}
.actor-alert{display:flex;align-items:center;gap:9px;padding:10px 11px;border-radius:10px;background:var(--warning-soft);color:var(--warning);font-size:12px;font-weight:600;border:1px solid var(--warning-border)}
.actor-alert.bad{background:var(--danger-soft);color:var(--danger);border-color:var(--danger-border)}
.actor-alert.good{background:var(--success-soft);color:var(--success);border-color:var(--success-border)}
.actor-chart{height:180px;position:relative}
.actor-chart svg{width:100%;height:100%;display:block}
.actor-donut{width:148px;height:148px;border-radius:50%;margin:0 auto;background:conic-gradient(var(--indigo-600) 0 62%, var(--indigo-400) 62% 82%, var(--indigo-200) 82% 100%);position:relative}
.actor-donut:after{content:"";position:absolute;inset:34px;background:var(--surface);border-radius:50%;box-shadow:inset 0 0 0 1px var(--border)}
.actor-legend{display:grid;gap:7px;margin-top:12px}
.actor-legend span{display:flex;justify-content:space-between;font-size:11.5px;color:var(--text-muted)}
.actor-form{display:grid;gap:9px}
.actor-input{width:100%;height:40px;border:1px solid var(--border);border-radius:10px;background:var(--surface);padding:0 11px;font-size:13px;color:var(--text)}
.actor-submit{height:42px;border:0;border-radius:10px;background:var(--primary);color:#fff;font-size:13px;font-weight:600;cursor:pointer}
.actor-money{font-family:var(--font-display);font-weight:800;color:var(--text);font-variant-numeric:tabular-nums}
.actor-empty{padding:26px 10px;text-align:center;color:var(--text-subtle);font-size:12.5px}
@media(max-width:1120px){.actor-kpis,.actor-kpis.k6,.actor-grid,.actor-grid.equal{grid-template-columns:1fr}.actor-hero{flex-direction:column}.actor-search{width:100%}}
`;

export function Hero({ title, sub }) {
  return (
    <div className="actor-hero">
      <div className="actor-greet">
        <h2>{title}</h2>
        <p>{sub}</p>
      </div>
      <div className="actor-search">
        <Search size={15} strokeWidth={2} aria-hidden="true" />
        Rechercher…
      </div>
    </div>
  );
}

export function Kpi({ icon, value, label, delta, bad, tone = "#6d2ee6", bg = "#f3edff" }) {
  return (
    <div className="actor-card" style={{ "--tone": tone, "--tone-bg": bg }}>
      <div className="actor-ico">{icon}</div>
      <div>
        <div className="actor-metric">{value}</div>
        <div className="actor-label">{label}</div>
        {delta ? <div className={`actor-delta ${bad ? "bad" : ""}`}>{delta}</div> : null}
      </div>
    </div>
  );
}

export function Panel({ title, sub, children }) {
  return (
    <div className="actor-panel">
      <div className="actor-panel-hd">
        <div>
          <div className="actor-panel-title">{title}</div>
          {sub ? <div className="actor-panel-sub">{sub}</div> : null}
        </div>
      </div>
      <div className="actor-panel-body">{children}</div>
    </div>
  );
}

export function Table({ columns, rows }) {
  return (
    <table className="actor-table">
      <thead><tr>{columns.map(col => <th key={col}>{col}</th>)}</tr></thead>
      <tbody>{rows.map((row, index) => (
        <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>
      ))}</tbody>
    </table>
  );
}


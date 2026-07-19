import { CalendarClock } from "lucide-react";
import { fmtCFA, fmtDate } from "@/components/ui/index";
import { DataTable, StatusBadge } from "@/design-system";

export default function PretSchedule({ schedule }) {
  const columns = [
    { key: "no", header: "N°", width: "56px", render: (r) => <span className="font-display font-bold text-ink-subtle">{r.no ?? r.num}</span> },
    { key: "due_date", header: "Échéance", render: (r) => (r.due_date ? fmtDate(r.due_date) : "—") },
    { key: "amount", header: "Montant dû", align: "right", render: (r) => <span className="font-display font-semibold">{fmtCFA(r.amount)}</span> },
    { key: "paid", header: "Payé", align: "right", render: (r) => <span className="font-display font-semibold text-success">{fmtCFA(r.paid || 0)}</span> },
    { key: "solde", header: "Solde", align: "right", render: (r) => <span className="font-display font-semibold">{fmtCFA(Math.max(0, r.amount - (r.paid || 0)))}</span> },
    { key: "status", header: "Statut", render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div>
      <div className="mb-2 text-[13px] font-semibold text-ink-muted">Échéancier de remboursement</div>
      <DataTable
        columns={columns}
        data={schedule}
        rowKey={(r) => r.no ?? r.num}
        empty={{ icon: CalendarClock, title: "Aucune échéance", message: "L'échéancier apparaîtra une fois le prêt actif." }}
      />
    </div>
  );
}

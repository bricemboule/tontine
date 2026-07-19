import { useEffect, useState } from "react";
import { Scale } from "lucide-react";
import { fmtCFA, fmtDate } from "@/components/ui/index";
import { PageHeader, Card, StatusBadge, Button, EmptyState } from "@/design-system";

export function PenaltiesPage({ api, toast, canPay = false }) {
  const [rows, setRows] = useState([]);
  useEffect(() => { api.getPenalties().then(setRows).catch(() => {}); }, []);

  const pay = async (penalty) => {
    await api.payPenalty(penalty.id, Number(penalty.amount || penalty.fine || 0));
    toast?.("Pénalité payée");
    setRows((prev) => prev.map((item) => (item.id === penalty.id ? { ...item, status: "paid", paid_amount: item.amount || item.fine } : item)));
  };

  const unpaid = rows.filter((row) => ["unpaid", "partial"].includes(row.status)).length;

  return (
    <>
      <PageHeader title="Pénalités" subtitle={`${unpaid} impayée(s)`} />
      <Card>
        {rows.length === 0 ? (
          <EmptyState icon={Scale} title="Aucune pénalité" message="Les pénalités appliquées apparaîtront ici." />
        ) : (
          rows.map((penalty) => (
            <div key={penalty.id} className="flex items-center gap-3 border-b border-line-soft px-5 py-3 last:border-0">
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold text-ink">{penalty.name || penalty.member_name || "Membre"}</div>
                <div className="text-[11.5px] text-ink-subtle">{penalty.reason || penalty.type} · {fmtDate(penalty.due_date || penalty.date)}</div>
              </div>
              <div className="font-display text-[14px] font-extrabold tabular-nums text-ink">{fmtCFA(penalty.amount || penalty.fine)}</div>
              <StatusBadge status={penalty.status} />
              {canPay && ["unpaid", "partial"].includes(penalty.status) && (
                <Button size="xs" onClick={() => pay(penalty)}>Payer</Button>
              )}
            </div>
          ))
        )}
      </Card>
    </>
  );
}

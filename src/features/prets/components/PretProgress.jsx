import { fmtCFA } from "@/components/ui/index";
import { Card, CardHeader, CardTitle } from "@/design-system";

export default function PretProgress({ loan, simulation, percent }) {
  const remaining = Math.max(0, simulation.total - loan.paid);

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Avancement</CardTitle>
        <span className="font-display text-[15px] font-bold text-primary-600 tabular-nums">{percent}%</span>
      </CardHeader>
      <div className="p-5">
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-primary-500 transition-[width]" style={{ width: `${percent}%` }} />
        </div>
        <div className="mt-3 flex flex-wrap justify-between gap-3 text-[12.5px] text-ink-muted">
          <span>Remboursé : <strong className="text-ink">{fmtCFA(loan.paid)}</strong></span>
          <span>Reste : <strong className={remaining > 0 ? "text-danger" : "text-success"}>{fmtCFA(remaining)}</strong></span>
          <span>Mensualité : <strong className="text-ink">{fmtCFA(simulation.monthly)}</strong></span>
        </div>
      </div>
    </Card>
  );
}

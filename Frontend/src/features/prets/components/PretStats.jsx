import { Banknote, Percent, Receipt, Wallet } from "lucide-react";
import { fmtCFA } from "@/components/ui/index";
import { StatCard } from "@/design-system";

export default function PretStats({ loan, simulation }) {
  return (
    <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Capital" value={fmtCFA(loan.amount)} icon={Banknote} />
      <StatCard label="Intérêts" value={fmtCFA(simulation.interest)} sub={`${loan.rate}%/an · ${loan.months} mois`} icon={Percent} />
      <StatCard label="Total dû" value={fmtCFA(simulation.total)} icon={Receipt} />
      <StatCard label="Remboursé" value={fmtCFA(loan.paid)} sub={`Reste : ${fmtCFA(Math.max(0, simulation.total - loan.paid))}`} icon={Wallet} />
    </div>
  );
}

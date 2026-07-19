import { Target, Users, Wallet, Percent } from "lucide-react";
import { fmtCFA } from "@/components/ui/index";
import { StatCard } from "@/design-system";

export default function CotisationStats({ cotisation, nbPaid, totalCollecte, taux }) {
  return (
    <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Montant cible" value={fmtCFA(cotisation.amount)} icon={Target} />
      <StatCard label="Membres inscrits" value={cotisation.inscrits?.length || 0} sub={`${nbPaid} payé(s)`} icon={Users} />
      <StatCard label="Total collecté" value={fmtCFA(totalCollecte)} icon={Wallet} />
      <StatCard label="Taux de paiement" value={`${taux}%`} icon={Percent} />
    </div>
  );
}

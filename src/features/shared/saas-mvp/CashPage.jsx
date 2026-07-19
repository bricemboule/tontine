import { useEffect, useState } from "react";
import { Wallet, Coins, ArrowDownCircle, Scale, HandCoins, Receipt, Download } from "lucide-react";
import { fmtCFA, fmtDate } from "@/components/ui/index";
import { PageHeader, StatCard, Card, CardHeader, CardTitle, Badge, Button, EmptyState } from "@/design-system";

export function CashPage({ api }) {
  const [data, setData] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => { api.getCashDashboard().then(setData).catch(() => {}); }, []);

  const totals = data?.totals || {};
  const movements = data?.movements || [];

  const doExport = async () => {
    setExporting(true);
    try { await api.exportReport("excel"); }
    catch (e) { alert(e.message || "Export impossible"); }
    finally { setExporting(false); }
  };

  return (
    <>
      <PageHeader
        title="Caisse"
        subtitle="Entrées, sorties et solde disponible"
        actions={
          <Button variant="outline" loading={exporting} iconLeft={<Download size={16} />} onClick={doExport}>
            Exporter Excel
          </Button>
        }
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Solde disponible" value={fmtCFA(totals.balance)} icon={Wallet} />
        <StatCard label="Cotisations encaissées" value={fmtCFA(totals.total_contributions)} icon={Coins} />
        <StatCard label="Décaissements" value={fmtCFA(totals.total_payouts)} icon={ArrowDownCircle} />
        <StatCard label="Pénalités" value={fmtCFA(totals.total_penalties)} icon={Scale} />
        <StatCard label="Prêts remboursés" value={fmtCFA(totals.total_loan_repayments)} icon={HandCoins} />
        <StatCard label="Dépenses" value={fmtCFA(totals.total_expenses)} icon={Receipt} />
      </div>

      <Card>
        <CardHeader><CardTitle>Mouvements récents</CardTitle></CardHeader>
        {movements.length === 0 ? (
          <EmptyState icon={Wallet} title="Aucun mouvement" message="Les entrées et sorties de caisse apparaîtront ici." />
        ) : (
          movements.map((m) => {
            const isExpense = m.type === "expense";
            return (
              <div key={m.id} className="flex items-center gap-3 border-b border-line-soft px-5 py-3 last:border-0">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold text-ink">{m.description || m.category}</div>
                  <div className="text-[11.5px] text-ink-subtle">{m.category} · {fmtDate(m.created_at)}</div>
                </div>
                <div className={`font-display text-[14px] font-extrabold tabular-nums ${isExpense ? "text-danger" : "text-success"}`}>
                  {isExpense ? "−" : "+"}{fmtCFA(m.amount)}
                </div>
                <Badge variant={isExpense ? "danger" : "success"}>{isExpense ? "Sortie" : "Entrée"}</Badge>
              </div>
            );
          })
        )}
      </Card>
    </>
  );
}

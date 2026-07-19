import { useEffect, useState } from "react";
import { Building2, Coins, CalendarClock } from "lucide-react";
import { fmtCFA } from "@/components/ui/index";
import { PageHeader, StatCard, Card, CardHeader, CardTitle } from "@/design-system";

export function TontineOverviewPage({ api }) {
  const [config, setConfig] = useState(null);
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    api.getConfig().then(setConfig).catch(() => {});
    api.getCurrentTontine().then(setCurrent).catch(() => {});
  }, []);

  const params = [
    ["Type", config?.type],
    ["Statut", config?.status],
    ["Schéma DB", config?.schema || current?.schema_name],
    ["Membres max", config?.max_members],
    ["Taux prêts", config?.loan_interest_rate ? `${config.loan_interest_rate}%` : "—"],
    ["Délai de grâce", config?.grace_days ? `${config.grace_days} jours` : "—"],
  ];

  return (
    <>
      <PageHeader title="Tontine" subtitle={current?.organization_name || "Organisation"} />

      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <StatCard label="Nom" value={config?.name || current?.name || "—"} icon={Building2} />
        <StatCard label="Cotisation" value={fmtCFA(config?.cotisation_amount)} icon={Coins} />
        <StatCard label="Fréquence" value={config?.frequency || "—"} icon={CalendarClock} />
      </div>

      <Card>
        <CardHeader><CardTitle>Paramètres</CardTitle></CardHeader>
        <div className="p-5">
          {params.map(([label, value]) => (
            <div key={label} className="flex justify-between border-b border-line-soft py-2 text-[13px] last:border-0">
              <span className="text-ink-subtle">{label}</span>
              <span className="font-semibold text-ink">{value || "—"}</span>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

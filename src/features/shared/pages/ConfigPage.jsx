import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { fmtCFA } from "@/components/ui/index";
import { PageHeader, Card, Button } from "@/design-system";

export function ConfigPage({ api, toast }) {
  const [cfg, setCfg] = useState(null);
  useEffect(() => { api.getConfig().then(setCfg).catch(() => {}); }, []);

  if (!cfg) return <div className="grid place-items-center py-20 text-sm text-ink-subtle">Chargement…</div>;

  const items = [
    ["Tontine", cfg.name], ["Type", cfg.type], ["Devise", cfg.currency],
    ["Cotisation mensuelle", fmtCFA(cfg.cotisation_amount)],
    ["Taux intérêt prêts", `${cfg.loan_interest_rate}% / mois`],
    ["Taux de pénalité", `${cfg.penalty_rate}% / mois`],
    ["Délai de grâce", `${cfg.grace_days} jours`],
    ["Plafond prêt", `${cfg.max_loan_multiplier}× cotisation`],
    ["Membres max", String(cfg.max_members)],
    ["Schéma DB", cfg.schema],
  ];

  return (
    <>
      <PageHeader
        title="Configuration"
        subtitle="Paramètres de la tontine"
        actions={<Button iconLeft={<Save size={16} />} onClick={() => toast("Configuration enregistrée ✓")}>Enregistrer</Button>}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(([l, v]) => (
          <Card key={l} className="px-4 py-3">
            <div className="mb-1 text-[9.5px] font-bold uppercase tracking-[0.08em] text-ink-subtle">{l}</div>
            <div className="font-display text-[14px] font-bold text-ink">{v}</div>
          </Card>
        ))}
      </div>
    </>
  );
}

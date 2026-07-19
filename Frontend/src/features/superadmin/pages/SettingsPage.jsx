import { useEffect, useState } from "react";
import { Globe, ShieldCheck, CreditCard } from "lucide-react";
import { fmtCFA } from "@/components/ui/index";
import { PageHeader, Card, CardHeader, CardTitle, CardSubtitle, Badge } from "@/design-system";

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line-soft px-5 py-3.5 last:border-0">
      <span className="text-[13px] text-ink-muted">{label}</span>
      <span className="text-right text-[13px] font-semibold text-ink">{children}</span>
    </div>
  );
}

const GENERAL = [
  ["Devise par défaut", "FCFA (XAF)"],
  ["Fuseau horaire", "Afrique/Douala (UTC+1)"],
  ["Langue de l'interface", "Français"],
];

const SECURITY = [
  ["Durée de session", "30 minutes"],
  ["Protection anti-intrusion", "activée"],
  ["Isolation des données par organisation", "activée"],
];

export default function SettingsPage({ api }) {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    api?.getSubscriptionPlans?.().then((p) => setPlans(Array.isArray(p) ? p : [])).catch(() => {});
  }, [api]);

  return (
    <>
      <PageHeader title="Paramètres de la plateforme" subtitle="Configuration générale de l'espace SaaS" />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary-strong)]"><Globe size={16} /></span>
              <CardTitle>Général</CardTitle>
            </div>
          </CardHeader>
          {GENERAL.map(([l, v]) => <Row key={l} label={l}>{v}</Row>)}
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary-strong)]"><ShieldCheck size={16} /></span>
              <CardTitle>Sécurité &amp; accès</CardTitle>
            </div>
          </CardHeader>
          {SECURITY.map(([l, v]) => (
            <Row key={l} label={l}>
              {v === "activée" ? <Badge variant="success" dot>Activée</Badge> : v}
            </Row>
          ))}
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary-strong)]"><CreditCard size={16} /></span>
              <CardTitle>Plans d'abonnement</CardTitle>
            </div>
            <CardSubtitle>Gérez les abonnements dans la section « Abonnements ».</CardSubtitle>
          </div>
        </CardHeader>
        {plans.length === 0 ? (
          <p className="px-5 py-6 text-center text-[13px] text-ink-subtle">Aucun plan configuré.</p>
        ) : (
          plans.map((plan) => (
            <div key={plan.id} className="flex flex-wrap items-center gap-4 border-b border-line-soft px-5 py-3.5 last:border-0">
              <div className="min-w-[140px] flex-1">
                <div className="text-[13px] font-semibold text-ink">{plan.name}</div>
                <div className="text-[11.5px] text-ink-subtle">
                  {plan.max_tontines ?? "∞"} tontine(s) · {plan.max_members ?? "∞"} membre(s)
                </div>
              </div>
              <div className="font-display text-[15px] font-bold text-ink tabular-nums">
                {plan.price_monthly > 0 ? `${fmtCFA(plan.price_monthly)}/mois` : "Gratuit"}
              </div>
              <Badge variant={plan.status === "active" ? "success" : "neutral"} dot>
                {plan.status === "active" ? "Actif" : plan.status}
              </Badge>
            </div>
          ))
        )}
      </Card>
    </>
  );
}

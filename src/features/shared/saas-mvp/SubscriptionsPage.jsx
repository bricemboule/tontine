import { useEffect, useState } from "react";
import { Layers } from "lucide-react";
import { fmtCFA, fmtDate } from "@/components/ui/index";
import { PageHeader, Card, CardHeader, CardTitle, StatusBadge, EmptyState } from "@/design-system";

export function SubscriptionsPage({ api }) {
  const [plans, setPlans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);

  useEffect(() => {
    api.getSubscriptionPlans().then(setPlans).catch(() => {});
    api.getSubscriptions().then(setSubscriptions).catch(() => {});
  }, []);

  return (
    <>
      <PageHeader title="Abonnements SaaS" subtitle="Plans et abonnements actifs" />

      <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className="p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="font-display text-[15px] font-bold text-ink">{plan.name}</div>
              <StatusBadge status={plan.status} />
            </div>
            <div className="mt-2 font-display text-[24px] font-extrabold text-ink tabular-nums">{fmtCFA(plan.price_monthly || 0)}</div>
            <div className="mt-2 text-[12px] text-ink-subtle">
              {plan.max_tontines || "∞"} tontines · {plan.max_members || "∞"} membres
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Abonnements actifs</CardTitle></CardHeader>
        {subscriptions.length === 0 ? (
          <EmptyState icon={Layers} title="Aucun abonnement" message="Les abonnements actifs apparaîtront ici." />
        ) : (
          subscriptions.map((sub) => (
            <div key={sub.id} className="flex items-center gap-3 border-b border-line-soft px-5 py-3 last:border-0">
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold text-ink">{sub.organization_name}</div>
                <div className="text-[11.5px] text-ink-subtle">{sub.plan_name} · Depuis {fmtDate(sub.started_at)}</div>
              </div>
              <StatusBadge status={sub.status} />
            </div>
          ))
        )}
      </Card>
    </>
  );
}

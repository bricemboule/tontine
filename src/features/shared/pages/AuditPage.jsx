import { useState, useEffect } from "react";
import { ScrollText } from "lucide-react";
import { PageHeader, Card, EmptyState, cn } from "@/design-system";

export function AuditPage({ api }) {
  const [logs, setLogs] = useState([]);
  useEffect(() => { api.getAuditLogs().then(setLogs).catch(() => {}); }, []);

  const dot = (level) => (level === "error" ? "bg-danger" : level === "warn" ? "bg-warning" : "bg-success");

  return (
    <>
      <PageHeader title="Journal d'audit" subtitle="Opérations sensibles" />
      <Card>
        {logs.length === 0 ? (
          <EmptyState icon={ScrollText} title="Aucun journal" message="Les opérations sensibles seront tracées ici." />
        ) : (
          logs.map((l) => (
            <div key={l.id} className="flex items-start gap-3.5 border-b border-line-soft px-5 py-3 last:border-0">
              <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", dot(l.level))} />
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex items-center gap-2.5">
                  <code className="font-mono text-[11.5px] text-primary-600">{l.action}</code>
                  {l.user && <span className="text-[11px] text-ink-subtle">{l.user}</span>}
                </div>
                <div className="text-[12.5px] text-ink-muted">{l.detail}</div>
              </div>
              <div className="whitespace-nowrap font-display text-[10.5px] text-ink-subtle">{l.at}</div>
            </div>
          ))
        )}
      </Card>
    </>
  );
}

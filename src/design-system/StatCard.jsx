import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "./cn";

/* Carte statistique. Remplace ui/Stat. */
export function StatCard({ label, value, sub, icon: Icon, trend, className = "" }) {
  return (
    <div className={cn("rounded-lg border border-line bg-surface p-[18px] shadow-xs", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[12px] font-semibold uppercase tracking-[0.04em] text-ink-muted">{label}</div>
          <div className="mt-1 font-display text-[26px] font-extrabold leading-none tracking-tight text-ink tabular-nums">
            {value}
          </div>
        </div>
        {Icon && (
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-[var(--primary-soft)] text-[var(--primary-strong)]">
            <Icon size={18} strokeWidth={2} />
          </span>
        )}
      </div>
      {(sub || trend) && (
        <div className="mt-2 flex items-center gap-1.5 text-[12.5px] font-semibold">
          {trend && (
            <span className={cn("inline-flex items-center gap-0.5", trend.dir === "down" ? "text-danger" : "text-success")}>
              {trend.dir === "down" ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
              {trend.value}
            </span>
          )}
          {sub && <span className="text-ink-muted">{sub}</span>}
        </div>
      )}
    </div>
  );
}

export default StatCard;

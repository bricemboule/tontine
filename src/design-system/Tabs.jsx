import { cn } from "./cn";

/* Onglets segmentés. items: [{ id, label, count }]. Remplace .tabs/.tab. */
export function Tabs({ items, value, onChange, className = "" }) {
  return (
    <div
      role="tablist"
      className={cn("flex flex-wrap gap-1 rounded-lg border border-line bg-surface-2 p-1", className)}
    >
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange?.(item.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-md px-3.5 py-1.5 text-[13px] font-semibold transition",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
              active
                ? "bg-surface text-primary-700 shadow-xs"
                : "text-ink-muted hover:text-ink"
            )}
          >
            {item.label}
            {item.count != null && (
              <span
                className={cn(
                  "min-w-[20px] rounded-full px-1.5 py-px text-center text-[11px] font-bold tabular-nums",
                  active ? "bg-[var(--primary-soft)] text-[var(--primary-strong)]" : "bg-line text-ink-muted"
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;

import { ArrowLeft } from "lucide-react";
import { cn } from "./cn";

/* En-tête de page. Remplace SectionHeader (.section-head). */
export function PageHeader({ title, subtitle, actions, onBack, className = "" }) {
  return (
    <div className={cn("mb-5 flex flex-wrap items-start justify-between gap-4", className)}>
      <div className="flex items-start gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Retour"
            className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-md border border-line bg-surface text-ink transition hover:border-primary-500 hover:text-primary-700"
          >
            <ArrowLeft size={18} strokeWidth={2} />
          </button>
        )}
        <div>
          <h1 className="font-display text-2xl font-bold leading-tight tracking-tight text-ink text-balance">
            {title}
          </h1>
          {subtitle && <p className="mt-1 text-[13.5px] text-ink-muted">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export default PageHeader;

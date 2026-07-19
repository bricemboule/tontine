import { Inbox } from "lucide-react";
import { cn } from "./cn";

/* État vide réutilisable. Remplace ui/Empty. */
export function EmptyState({ icon: Icon = Inbox, title = "Aucune donnée", message, action, className = "" }) {
  return (
    <div className={cn("flex flex-col items-center gap-3 px-6 py-14 text-center", className)}>
      <span className="grid h-14 w-14 place-items-center rounded-full bg-surface-2 text-ink-subtle">
        <Icon size={26} strokeWidth={1.7} />
      </span>
      <div>
        <p className="text-[15px] font-semibold text-ink">{title}</p>
        {message && <p className="mt-1 max-w-sm text-[13px] text-ink-muted">{message}</p>}
      </div>
      {action}
    </div>
  );
}

export default EmptyState;

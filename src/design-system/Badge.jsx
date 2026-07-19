import { cn } from "./cn";

/* Badge / pastille de statut. Sémantique cohérente + variante `role`
   discrète (l'identité reste indigo, le rôle ne colore pas toute l'UI). */

const VARIANTS = {
  success: "text-success bg-success-soft border-success-border",
  warning: "text-warning bg-warning-soft border-warning-border",
  danger: "text-danger bg-danger-soft border-danger-border",
  info: "text-info bg-info-soft border-info-border",
  neutral: "text-ink-muted bg-surface-2 border-line",
  role: "text-[var(--primary-strong)] bg-[var(--primary-soft)] border-[var(--primary-softer)]",
};

export function Badge({ variant = "neutral", dot = false, className = "", children, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        VARIANTS[variant],
        className
      )}
      {...props}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  );
}

export default Badge;

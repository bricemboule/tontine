import { cn } from "./cn";

/* Carte de surface. Remplace .card / .card-hd (héritage AdminLTE). */

export function Card({ className = "", children, ...props }) {
  return (
    <div
      className={cn("rounded-lg border border-line bg-surface shadow-xs", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children, ...props }) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 border-b border-line-soft px-5 py-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ className = "", children, ...props }) {
  return (
    <h3 className={cn("font-display text-[17px] font-bold text-ink", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardSubtitle({ className = "", children, ...props }) {
  return (
    <p className={cn("mt-0.5 text-[13px] text-ink-subtle", className)} {...props}>
      {children}
    </p>
  );
}

export function CardBody({ className = "", children, ...props }) {
  return (
    <div className={cn("p-5", className)} {...props}>
      {children}
    </div>
  );
}

export default Card;

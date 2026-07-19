import { useId } from "react";
import { cn } from "./cn";

/* Select natif stylé, cohérent avec InputField. */
const CHEVRON =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238E88A0' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")";

export function Select({ label, hint, error, id, className = "", children, ...props }) {
  const autoId = useId();
  const selectId = id || autoId;
  const hasError = Boolean(error);
  const showMsg = typeof error === "string" && error.length > 0;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={selectId} className="text-[13px] font-semibold text-ink">
          {label}
        </label>
      )}
      <select
        id={selectId}
        aria-invalid={hasError || undefined}
        className={cn(
          "h-11 w-full appearance-none rounded-md border bg-surface pl-3.5 pr-9 text-[14px] text-ink outline-none transition",
          "focus:border-primary-500 focus:ring-2 focus:ring-brand",
          hasError ? "border-danger" : "border-line"
        )}
        style={{ backgroundImage: CHEVRON, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
        {...props}
      >
        {children}
      </select>
      {showMsg ? (
        <p className="text-[12px] font-medium text-danger">{error}</p>
      ) : hint ? (
        <p className="text-[12px] text-ink-subtle">{hint}</p>
      ) : null}
    </div>
  );
}

export default Select;

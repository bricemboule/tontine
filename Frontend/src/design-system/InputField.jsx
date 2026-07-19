import { useId } from "react";
import { cn } from "./cn";

/* Champ standard : label + input + aide + erreur, icône et adornment
   optionnels. Remplace les champs re-codés à la main + .field-input. */

export function InputField({
  label,
  hint,
  error,
  icon: Icon,
  endAdornment,
  className = "",
  inputClassName = "",
  id,
  ...props
}) {
  const autoId = useId();
  const inputId = id || autoId;
  const hasError = Boolean(error);
  const showMsg = typeof error === "string" && error.length > 0;
  const describedBy = showMsg ? `${inputId}-err` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={inputId} className="text-[13px] font-semibold text-ink">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <Icon
            aria-hidden="true"
            className="pointer-events-none absolute left-3 h-[18px] w-[18px] text-ink-subtle"
            strokeWidth={1.9}
          />
        )}
        <input
          id={inputId}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
          className={cn(
            "h-11 w-full rounded-md border bg-surface text-[14px] text-ink outline-none transition",
            "placeholder:text-ink-subtle",
            "focus:border-primary-500 focus:ring-2 focus:ring-brand",
            Icon ? "pl-10" : "pl-3.5",
            endAdornment ? "pr-11" : "pr-3.5",
            hasError ? "border-danger focus:ring-danger/25" : "border-line",
            inputClassName
          )}
          {...props}
        />
        {endAdornment && (
          <div className="absolute right-2.5 flex items-center">{endAdornment}</div>
        )}
      </div>
      {showMsg ? (
        <p id={`${inputId}-err`} className="flex items-center gap-1 text-[12px] font-medium text-danger">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-[12px] text-ink-subtle">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export default InputField;

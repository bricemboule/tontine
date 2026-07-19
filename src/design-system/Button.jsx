import { cn } from "./cn";
import { Spinner } from "./Spinner";

/* Bouton unique du design system.
   Remplace .btn-p / .btn-g / .btn-grn (héritage Bootstrap) et les
   boutons inline. Variantes sémantiques + 5 tailles + état chargement. */

const BASE =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold " +
  "rounded-md border border-transparent select-none " +
  "transition-[background-color,border-color,box-shadow,transform,filter] duration-150 " +
  "active:translate-y-px focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ground)] " +
  "disabled:opacity-50 disabled:pointer-events-none";

const VARIANTS = {
  primary: "bg-primary-600 text-white shadow-xs hover:bg-primary-700",
  secondary:
    "bg-[var(--primary-soft)] text-[var(--primary-strong)] border-[var(--primary-softer)] hover:bg-[var(--primary-softer)]",
  outline:
    "bg-surface text-ink border-line hover:border-primary-500 hover:text-[var(--primary-strong)]",
  ghost: "bg-transparent text-ink-muted hover:bg-surface-2 hover:text-ink",
  danger: "bg-danger text-white hover:brightness-95",
  success: "bg-success text-white hover:brightness-95",
  link: "bg-transparent text-[var(--primary-strong)] hover:underline underline-offset-2 !h-auto !px-0",
};

const SIZES = {
  xs: "h-7 px-2.5 text-xs rounded-sm gap-1.5",
  sm: "h-8 px-3.5 text-[13px]",
  md: "h-10 px-[18px] text-sm",
  lg: "h-[46px] px-[22px] text-[15px]",
  xl: "h-[54px] px-7 text-base rounded-lg",
};

const ICON_ONLY = {
  xs: "w-7 px-0",
  sm: "w-8 px-0",
  md: "w-10 px-0",
  lg: "w-[46px] px-0",
  xl: "w-[54px] px-0",
};

export function Button({
  as: Tag = "button",
  variant = "primary",
  size = "md",
  loading = false,
  iconLeft = null,
  iconRight = null,
  iconOnly = false,
  fullWidth = false,
  className = "",
  disabled,
  children,
  ...props
}) {
  const isDisabled = disabled || loading;
  return (
    <Tag
      className={cn(
        BASE,
        VARIANTS[variant],
        SIZES[size],
        iconOnly && ICON_ONLY[size],
        fullWidth && "w-full",
        className
      )}
      disabled={Tag === "button" ? isDisabled : undefined}
      aria-busy={loading || undefined}
      aria-disabled={Tag !== "button" && isDisabled ? true : undefined}
      {...props}
    >
      {loading ? <Spinner className="h-[1.05em] w-[1.05em]" /> : iconLeft}
      {!iconOnly && children}
      {!loading && iconRight}
    </Tag>
  );
}

export default Button;

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "./cn";

/* Modale du design system. Overlay + panneau, fermeture par Échap et
   clic hors panneau, verrou du scroll, rôle dialog. Remplace .overlay/.modal. */

const SIZES = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl" };

export function Modal({ open, onClose, title, children, footer, size = "md", className = "" }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => { if (open) panelRef.current?.focus(); }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-4 sm:items-center"
      style={{ background: "rgba(15,10,22,.5)", backdropFilter: "blur(3px)", animation: "fadeIn .18s ease-out" }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : undefined}
        tabIndex={-1}
        className={cn(
          "my-auto w-full rounded-lg border border-line bg-surface shadow-pop outline-none",
          SIZES[size],
          className
        )}
        style={{ animation: "slideUp .22s ease-out" }}
      >
        {title && (
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <h2 className="font-display text-[17px] font-bold text-ink">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="grid h-8 w-8 place-items-center rounded-md text-ink-muted transition hover:bg-surface-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <X size={18} strokeWidth={2} />
            </button>
          </div>
        )}
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-line px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}

export default Modal;

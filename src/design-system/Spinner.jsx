import { cn } from "./cn";

// Spinner sobre : hérite de la couleur courante (currentColor).
export function Spinner({ className = "" }) {
  return (
    <span
      role="status"
      aria-label="Chargement"
      className={cn(
        "inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent",
        className
      )}
    />
  );
}

export default Spinner;

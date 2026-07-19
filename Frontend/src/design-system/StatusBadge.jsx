import { Badge } from "./Badge";

/* Mappe un statut métier vers une variante sémantique + un libellé FR.
   Source unique de vérité pour l'affichage des statuts. */

const MAP = {
  // Cotisations / périodes
  open: { variant: "success", label: "Ouverte" },
  closed: { variant: "neutral", label: "Clôturée" },
  // Membres
  active: { variant: "success", label: "Actif" },
  pending: { variant: "warning", label: "En attente" },
  pending_president: { variant: "warning", label: "Attente président" },
  suspended: { variant: "danger", label: "Suspendu" },
  rejected: { variant: "danger", label: "Rejeté" },
  // Paiements
  paid: { variant: "success", label: "Payé" },
  partial: { variant: "warning", label: "Partiel" },
  unpaid: { variant: "danger", label: "Impayé" },
  late: { variant: "danger", label: "En retard" },
  success: { variant: "success", label: "Validé" },
  failed: { variant: "danger", label: "Échoué" },
  reversed: { variant: "neutral", label: "Contre-passé" },
  // Prêts
  approved: { variant: "success", label: "Approuvé" },
  repaid: { variant: "success", label: "Remboursé" },
  ongoing: { variant: "info", label: "En cours" },
  // Réunions
  upcoming: { variant: "info", label: "À venir" },
  done: { variant: "success", label: "Terminée" },
  // Tours
  completed: { variant: "success", label: "Réalisé" },
  // Sanctions
  enforced: { variant: "danger", label: "Active" },
  lifted: { variant: "neutral", label: "Levée" },
  // Divers
  draft: { variant: "neutral", label: "Brouillon" },
  scheduled: { variant: "info", label: "Planifiée" },
  cancelled: { variant: "neutral", label: "Annulée" },
};

export function StatusBadge({ status, label, dot = true, ...props }) {
  const entry = MAP[status] || { variant: "neutral", label: label || String(status || "—").replaceAll("_", " ") };
  return (
    <Badge variant={entry.variant} dot={dot} {...props}>
      {label || entry.label}
    </Badge>
  );
}

export default StatusBadge;

import MemberActionCard from "../components/MemberActionCard";

export default function MemberValidate() {
  return (
    <MemberActionCard
      config={{
        title: "Valider l'adhésion",
        cardTitle: "Dossier d'adhésion",
        noticeVariant: "info",
        notice: (m) => <><strong>{m.name}</strong> sera inscrit comme membre actif et ajouté aux cotisations en cours.</>,
        reason: false,
        confirmLabel: "Valider l'adhésion",
        confirmingLabel: "Validation…",
        variant: "success",
        run: (api, id) => api.validateMember(id, "approve"),
        success: (m) => `${m.name} validé(e) — bienvenue dans la tontine ✓`,
      }}
    />
  );
}

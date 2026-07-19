import MemberActionCard from "../components/MemberActionCard";

export default function MemberReject() {
  return (
    <MemberActionCard
      config={{
        title: "Rejeter la demande d'adhésion",
        cardTitle: "Motif de rejet",
        noticeVariant: "warning",
        notice: () => "Le rejet est définitif. Le membre sera notifié par SMS avec le motif indiqué ci-dessous.",
        reason: true,
        reasonLabel: "Motif du rejet (obligatoire)",
        reasonPlaceholder: "ex : Documents incomplets, critères non remplis, quota atteint…",
        confirmLabel: "Confirmer le rejet",
        confirmingLabel: "Rejet…",
        variant: "danger",
        run: (api, id, reason) => api.validateMember(id, "reject", reason),
        success: () => "Demande d'adhésion rejetée",
      }}
    />
  );
}

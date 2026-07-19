import MemberActionCard from "../components/MemberActionCard";

export default function MemberSuspend() {
  return (
    <MemberActionCard
      config={{
        title: "Suspendre un membre",
        cardTitle: "Confirmation de suspension",
        noticeVariant: "warning",
        notice: () => <>La suspension est <strong>réversible</strong>. Le membre sera notifié par SMS et ne pourra plus participer aux activités.</>,
        reason: true,
        reasonLabel: "Motif de la suspension (obligatoire)",
        reasonPlaceholder: "ex : Absences répétées non justifiées, non-paiement persistant…",
        confirmLabel: "Confirmer la suspension",
        confirmingLabel: "Suspension…",
        variant: "danger",
        run: (api, id, reason) => api.suspendMember(id, reason),
        success: (m) => `${m.name} suspendu(e)`,
      }}
    />
  );
}

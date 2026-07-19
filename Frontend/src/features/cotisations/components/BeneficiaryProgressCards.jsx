import { CheckCircle2, Clock } from "lucide-react";
import { Av, fmtDate } from "@/components/ui/index";
import { Card, CardHeader, CardTitle, CardSubtitle, Badge, EmptyState } from "@/design-system";

function MemberRow({ member, tourByMember, memberName, badge }) {
  const tour = tourByMember.get(Number(member.id));
  return (
    <div className="flex items-center gap-3 border-b border-line-soft px-5 py-3 last:border-0">
      <Av name={memberName(member)} id={member.id} size={30} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-semibold text-ink">{memberName(member)}</div>
        <div className="mt-0.5 text-[12px] text-ink-subtle">
          {tour?.pos ? `Tour n° ${tour.pos}` : "Tour non attribué"} · {tour?.date ? fmtDate(tour.date) : "Non programmé"}
        </div>
      </div>
      {badge}
    </div>
  );
}

export default function BeneficiaryProgressCards({ alreadyBenefited, notYetBenefited, tourByMember, memberName }) {
  return (
    <div className="mb-4 grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Ont déjà bénéficié</CardTitle>
            <CardSubtitle>{alreadyBenefited.length} membre(s) déjà servi(s)</CardSubtitle>
          </div>
        </CardHeader>
        {alreadyBenefited.length === 0 ? (
          <EmptyState icon={CheckCircle2} title="Aucun bénéficiaire" message="Aucun tour attribué pour le moment." />
        ) : (
          alreadyBenefited.map((m) => (
            <MemberRow key={m.id} member={m} tourByMember={tourByMember} memberName={memberName}
              badge={<Badge variant="success" dot>Déjà servi</Badge>} />
          ))
        )}
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>N'ont pas encore bénéficié</CardTitle>
            <CardSubtitle>{notYetBenefited.length} membre(s) en attente</CardSubtitle>
          </div>
        </CardHeader>
        {notYetBenefited.length === 0 ? (
          <EmptyState icon={Clock} title="Tous servis" message="Tous les membres actifs ont déjà bénéficié." />
        ) : (
          notYetBenefited.map((m) => (
            <MemberRow key={m.id} member={m} tourByMember={tourByMember} memberName={memberName}
              badge={<Badge variant="warning" dot>En attente</Badge>} />
          ))
        )}
      </Card>
    </div>
  );
}

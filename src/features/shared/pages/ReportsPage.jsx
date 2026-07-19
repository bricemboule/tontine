import { useState, useEffect } from "react";
import { FileSpreadsheet, FileText, Mail, TrendingUp, Wallet, Users } from "lucide-react";
import { Av, CashflowChart, fmtCFA } from "@/components/ui/index";
import { PageHeader, StatCard, Card, CardHeader, CardTitle, CardSubtitle, DataTable, StatusBadge, Button } from "@/design-system";

function Progress({ value, max }) {
  const pct = Math.min(100, Math.round((value / Math.max(max, 1)) * 100));
  return (
    <div className="h-1.5 w-full max-w-[160px] overflow-hidden rounded-full bg-line">
      <div className="h-full rounded-full bg-primary-500" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function ReportsPage({ api, toast, members = [] }) {
  const [cashflow, setCashflow] = useState([]);
  useEffect(() => { api.getCashflow().then(setCashflow).catch(() => {}); }, []);

  const active = members.filter((m) => m.status === "active");
  const onTime = active.filter((m) => m.cp === m.ct);
  const rate = active.length ? Math.round((onTime.length / active.length) * 100) : 0;
  const total = members.reduce((s, m) => s + m.cp * 50000, 0);

  const columns = [
    {
      key: "name", header: "Membre", width: "38%",
      render: (m) => (
        <div className="flex items-center gap-2.5">
          <Av name={m.name} id={m.id} size={28} />
          <div>
            <div className="text-[13px] font-semibold text-ink">{m.name}</div>
            <div className="text-[10.5px] text-ink-subtle">{m.role}</div>
          </div>
        </div>
      ),
    },
    { key: "avancement", header: "Avancement", render: (m) => <Progress value={m.cp} max={m.ct} /> },
    { key: "montant", header: "Montant", align: "right", render: (m) => <span className="font-display font-bold">{fmtCFA(m.cp * 50000)}</span> },
    { key: "statut", header: "Statut", render: (m) => <StatusBadge status={m.cp === m.ct ? "active" : m.cp > 0 ? "pending" : "suspended"} /> },
  ];

  return (
    <>
      <PageHeader
        title="Rapports & statistiques"
        subtitle="Vue d'ensemble du recouvrement"
        actions={
          <>
            <Button variant="outline" size="sm" iconLeft={<FileSpreadsheet size={16} />} onClick={() => toast("Export Excel généré")}>Excel</Button>
            <Button variant="outline" size="sm" iconLeft={<FileText size={16} />} onClick={() => toast("Export PDF généré")}>PDF</Button>
            <Button variant="outline" size="sm" iconLeft={<Mail size={16} />} onClick={() => toast("Email envoyé")}>Email</Button>
          </>
        }
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Taux de recouvrement" value={`${rate}%`} sub={`${onTime.length}/${active.length} à jour`} icon={TrendingUp} />
        <StatCard label="Total collecté" value={fmtCFA(total)} icon={Wallet} />
        <StatCard label="Membres actifs" value={active.length} sub={`sur ${members.length} total`} icon={Users} />
      </div>

      <Card className="mb-4">
        <CardHeader>
          <div>
            <CardTitle>Flux de trésorerie</CardTitle>
            <CardSubtitle>6 derniers mois</CardSubtitle>
          </div>
        </CardHeader>
        <div className="p-4"><CashflowChart data={cashflow} /></div>
      </Card>

      <div className="mb-2 text-[13px] font-semibold text-ink-muted">Bilan par membre</div>
      <DataTable
        columns={columns}
        data={members.filter((m) => m.status !== "excluded")}
        rowKey={(m) => m.id}
        empty={{ icon: Users, title: "Aucun membre", message: "Le bilan par membre apparaîtra ici." }}
      />
    </>
  );
}

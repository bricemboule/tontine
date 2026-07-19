import { useEffect, useState } from "react";
import { ReceiptText, FileText } from "lucide-react";
import { fmtCFA, fmtDate } from "@/components/ui/index";
import { PageHeader, Card, Badge, Button, EmptyState } from "@/design-system";

export function ReceiptsPage({ api }) {
  const [rows, setRows] = useState([]);
  useEffect(() => { api.getReceipts().then(setRows).catch(() => {}); }, []);

  return (
    <>
      <PageHeader title="Reçus" subtitle="Paiements, pénalités et remboursements" />
      <Card>
        {rows.length === 0 ? (
          <EmptyState icon={ReceiptText} title="Aucun reçu" message="Les reçus générés apparaîtront ici." />
        ) : (
          rows.map((receipt) => (
            <div key={receipt.id} className="flex items-center gap-3 border-b border-line-soft px-5 py-3 last:border-0">
              <div className="min-w-0 flex-1">
                <div className="font-display text-[13px] font-bold text-ink">{receipt.number}</div>
                <div className="text-[11.5px] text-ink-subtle">{receipt.member_name || "Membre"} · {receipt.type} · {fmtDate(receipt.created_at)}</div>
              </div>
              <div className="font-display text-[14px] font-extrabold tabular-nums text-ink">{fmtCFA(receipt.amount)}</div>
              <Badge variant="neutral">{receipt.type}</Badge>
              <Button as="a" variant="outline" size="xs" iconLeft={<FileText size={13} />} href={`/api/receipts/${receipt.id}/pdf`} target="_blank" rel="noreferrer">PDF</Button>
            </div>
          ))
        )}
      </Card>
    </>
  );
}

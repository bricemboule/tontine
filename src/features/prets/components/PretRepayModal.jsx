import { fmtCFA } from "@/components/ui/index";
import { Modal, InputField, Select, Button } from "@/design-system";

const METHODS = [
  { value: "especes", label: "Espèces" },
  { value: "orange_money", label: "Orange Money" },
  { value: "mtn_momo", label: "MTN MoMo" },
  { value: "virement", label: "Virement" },
];

export default function PretRepayModal({ open, loan, simulation, form, setForm, loading, onClose, onConfirm }) {
  const remaining = Math.max(0, simulation.total - loan.paid);
  const willSettle = form.amount && parseFloat(form.amount) >= remaining;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Enregistrer un remboursement"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button variant="success" loading={loading} disabled={!form.amount} onClick={onConfirm}>
            {loading ? "Enregistrement…" : "Confirmer le remboursement"}
          </Button>
        </>
      }
    >
      <div className="mb-4 rounded-md bg-surface-2 px-3.5 py-3">
        <div className="mb-1.5 flex justify-between text-[12.5px]">
          <span className="text-ink-muted">Mensualité recommandée</span>
          <span className="font-display font-extrabold text-ink">{fmtCFA(simulation.monthly)}</span>
        </div>
        <div className="flex justify-between text-[12.5px]">
          <span className="text-ink-muted">Solde restant</span>
          <span className="font-display font-extrabold text-danger">{fmtCFA(remaining)}</span>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <InputField
          label="Montant remboursé (FCFA)"
          type="number"
          value={form.amount}
          onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
          placeholder={String(simulation.monthly)}
        />
        <Select label="Mode de paiement" value={form.method} onChange={(e) => setForm((p) => ({ ...p, method: e.target.value }))}>
          {METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
        </Select>
        {willSettle && (
          <div className="rounded-md border border-success-border bg-success-soft px-3.5 py-2.5 text-[13px] font-medium text-success">
            ✓ Ce paiement soldera intégralement le prêt.
          </div>
        )}
      </div>
    </Modal>
  );
}

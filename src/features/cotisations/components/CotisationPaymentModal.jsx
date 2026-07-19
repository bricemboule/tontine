import { fmtCFA } from "@/components/ui/index";
import { Modal, Select, InputField, Button } from "@/design-system";

const METHODS = [
  { value: "especes", label: "Espèces" },
  { value: "orange_money", label: "Orange Money" },
  { value: "mtn_momo", label: "MTN MoMo" },
  { value: "virement", label: "Virement" },
];

export default function CotisationPaymentModal({ open, cotisation, payForm, setPayForm, loading, onClose, onConfirm }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Enregistrer un paiement"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button variant="success" loading={loading} disabled={!payForm.mid || !payForm.amount} onClick={onConfirm}>
            {loading ? "Enregistrement…" : "Confirmer"}
          </Button>
        </>
      }
    >
      <div className="mb-4 rounded-md bg-surface-2 px-3.5 py-3 text-[13px] text-ink-muted">
        <span className="font-semibold text-ink">{cotisation.label}</span> · Montant cible :{" "}
        <span className="font-semibold text-ink">{fmtCFA(cotisation.amount)}</span>
      </div>
      <div className="flex flex-col gap-4">
        <Select label="Membre" value={payForm.mid} onChange={(e) => setPayForm((p) => ({ ...p, mid: e.target.value }))}>
          <option value="">— Sélectionner un membre —</option>
          {cotisation.inscrits?.filter((i) => i.status !== "paid").map((i) => (
            <option key={i.member_id} value={i.member_id}>
              {i.member_name} — Reste : {fmtCFA(cotisation.amount - i.amount_paid)}
            </option>
          ))}
        </Select>
        <InputField
          label="Montant (FCFA)"
          type="number"
          value={payForm.amount}
          onChange={(e) => setPayForm((p) => ({ ...p, amount: e.target.value }))}
          placeholder={String(cotisation.amount)}
        />
        <Select label="Mode de paiement" value={payForm.method} onChange={(e) => setPayForm((p) => ({ ...p, method: e.target.value }))}>
          {METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
        </Select>
      </div>
    </Modal>
  );
}

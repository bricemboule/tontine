import { Modal, Button } from "@/design-system";

export default function PretRejectModal({ open, reason, setReason, loading, onClose, onConfirm }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Rejeter la demande"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button variant="danger" loading={loading} disabled={!reason.trim()} onClick={onConfirm}>
            {loading ? "Rejet…" : "Confirmer"}
          </Button>
        </>
      }
    >
      <div className="mb-4 rounded-md border border-warning-border bg-warning-soft px-3.5 py-3 text-[13px] text-ink">
        Le membre sera notifié du rejet avec le motif fourni.
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-semibold text-ink">Motif du rejet *</span>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="ex : Plafond dépassé, prêt en cours, dossier incomplet…"
          className="w-full resize-y rounded-md border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink outline-none transition placeholder:text-ink-subtle focus:border-primary-500 focus:ring-2 focus:ring-brand"
        />
      </label>
    </Modal>
  );
}

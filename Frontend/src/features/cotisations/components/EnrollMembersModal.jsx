import { Av } from "@/components/ui/index";
import { Modal, Button, EmptyState } from "@/design-system";
import { UserPlus } from "lucide-react";

export default function EnrollMembersModal({ open, nonInscrits, enrollSel, setEnrollSel, loading, onClose, onConfirm }) {
  const allSelected = nonInscrits.length > 0 && enrollSel.length === nonInscrits.length;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Inscrire des membres"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button loading={loading} disabled={!enrollSel.length} onClick={onConfirm}>
            {loading ? "Inscription…" : `Inscrire ${enrollSel.length} membre(s)`}
          </Button>
        </>
      }
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-[13px] text-ink-muted">{enrollSel.length} sélectionné(s)</span>
        {nonInscrits.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEnrollSel(allSelected ? [] : nonInscrits.map((m) => m.id))}
          >
            {allSelected ? "Tout désélectionner" : "Tout sélectionner"}
          </Button>
        )}
      </div>

      {nonInscrits.length === 0 ? (
        <EmptyState icon={UserPlus} title="Tous inscrits" message="Tous les membres actifs sont déjà inscrits." />
      ) : (
        <div className="max-h-[300px] overflow-y-auto rounded-md border border-line">
          {nonInscrits.map((m, i) => {
            const checked = enrollSel.includes(m.id);
            return (
              <label
                key={m.id}
                className={`flex cursor-pointer items-center gap-3 px-3.5 py-2.5 transition-colors ${
                  i < nonInscrits.length - 1 ? "border-b border-line-soft" : ""
                } ${checked ? "bg-[var(--primary-soft)]" : "hover:bg-surface-2"}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => setEnrollSel((p) => (e.target.checked ? [...p, m.id] : p.filter((x) => x !== m.id)))}
                  className="h-4 w-4 rounded border-line accent-primary-600 focus:ring-brand"
                />
                <Av name={m.name} id={m.id} size={30} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold text-ink">{m.name}</div>
                  <div className="text-[11px] text-ink-subtle">{m.role} · {m.phone}</div>
                </div>
              </label>
            );
          })}
        </div>
      )}
    </Modal>
  );
}

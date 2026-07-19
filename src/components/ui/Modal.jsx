export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <strong>{title}</strong>
          <button type="button" className="btn btn-g btn-sm" onClick={onClose}>
            Fermer
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

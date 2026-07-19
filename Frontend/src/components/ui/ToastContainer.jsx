export function ToastContainer({ toasts = [] }) {
  return (
    <div className="toast-wrap">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.type || "success"}`}>
          {toast.msg}
        </div>
      ))}
    </div>
  );
}

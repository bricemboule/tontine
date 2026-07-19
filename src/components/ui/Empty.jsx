export function Empty({ icon = "•", msg = "Aucune donnée" }) {
  return (
    <div className="empty">
      <div className="empty-ic">{icon}</div>
      <div>{msg}</div>
    </div>
  );
}

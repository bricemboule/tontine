export default function EmptyState({ message = "Aucune donnée" }) {
  return <div className="dash-empty">{message}</div>;
}

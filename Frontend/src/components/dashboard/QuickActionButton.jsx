export default function QuickActionButton({ icon, label, color }) {
  return (
    <button className="dash-action-btn" type="button" style={{ "--action-color": color }}>
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

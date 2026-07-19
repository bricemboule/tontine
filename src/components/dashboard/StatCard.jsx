export default function StatCard({ icon, label, value, trend, negative, color, background }) {
  return (
    <div className="dash-stat-card">
      <div
        className="dash-stat-icon"
        style={{ "--stat-color": color, "--stat-bg": background }}
      >
        {icon}
      </div>
      <div>
        <div className="dash-stat-value">{value}</div>
        <div className="dash-stat-label">{label}</div>
        {trend ? <div className={`dash-stat-trend ${negative ? "is-negative" : ""}`}>{trend}</div> : null}
      </div>
    </div>
  );
}

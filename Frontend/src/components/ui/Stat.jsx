export function Stat({ label, value, sub }) {
  return (
    <div className="card" style={{ marginBottom: 0 }}>
      <div style={{ padding: "16px 18px" }}>
        <div style={{ fontSize: 11, color: "var(--t3)", textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 700 }}>
          {label}
        </div>
        <div style={{ marginTop: 8, fontFamily: "var(--fd)", fontSize: 28, lineHeight: 1, fontWeight: 800 }}>
          {value}
        </div>
        {sub ? <div style={{ marginTop: 8, fontSize: 12, color: "var(--t2)" }}>{sub}</div> : null}
      </div>
    </div>
  );
}

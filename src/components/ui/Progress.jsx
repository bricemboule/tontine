export function Prg({ val = 0, max = 1 }) {
  const pct = Math.max(0, Math.min(100, Math.round((Number(val || 0) / Math.max(1, Number(max || 1))) * 100)));
  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          height: 8,
          borderRadius: 999,
          background: "var(--surf3)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            borderRadius: 999,
            background: "linear-gradient(90deg,var(--blue),#5ba8ff)",
          }}
        />
      </div>
    </div>
  );
}

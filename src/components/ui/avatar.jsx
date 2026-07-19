export function ini(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() || "")
    .join("");
}

export function avc(seed = "") {
  const palette = ["#1d6ef5", "#16a34a", "#d97706", "#7c3aed", "#dc2626", "#0891b2"];
  const index = String(seed)
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0) % palette.length;
  return palette[index];
}

export function Av({ name, id, size = 34 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        fontSize: Math.max(11, size * 0.34),
        fontWeight: 800,
        color: "#fff",
        background: avc(id || name),
        flexShrink: 0,
      }}
    >
      {ini(name)}
    </div>
  );
}

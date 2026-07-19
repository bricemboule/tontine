export function Badge({ status, children }) {
  const label = children || status || "—";
  const tone =
    status === "active"
      ? { background: "var(--gbg)", borderColor: "var(--gbd)", color: "var(--green)" }
      : status === "pending" || status === "pending_president"
        ? { background: "var(--ambg)", borderColor: "var(--ambd)", color: "var(--amber)" }
        : status === "suspended" || status === "rejected" || status === "closed"
          ? { background: "var(--rbg)", borderColor: "var(--rbd)", color: "var(--red)" }
          : { background: "var(--surf2)", borderColor: "var(--b)", color: "var(--t2)" };

  return (
    <span className="badge" style={tone}>
      {String(label).replaceAll("_", " ")}
    </span>
  );
}

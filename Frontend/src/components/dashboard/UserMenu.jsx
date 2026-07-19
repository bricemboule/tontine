export default function UserMenu({ name }) {
  const initials = String(name || "U")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="dash-user-menu">
      <div className="dash-avatar">{initials}</div>
      <div className="dash-user-name">{name}</div>
      <span style={{ color: "#94a3b8", fontSize: 11 }}>⌄</span>
    </div>
  );
}

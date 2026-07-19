export default function Sidebar({ menu = [], active = "Dashboard" }) {
  return (
    <aside className="dash-sidebar">
      <div className="dash-brand">
        <div className="dash-brand-mark">⌬</div>
        <div className="dash-brand-name">TontinePro</div>
      </div>

      <nav className="dash-nav">
        {menu.map(item => (
          <button
            className={`dash-nav-item ${item.label === active ? "is-active" : ""}`}
            type="button"
            key={item.label}
          >
            <span className="dash-nav-icon">{item.icon}</span>
            <span className="dash-nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

import {
  LayoutDashboard,
  Users,
  Coins,
  HandCoins,
  CreditCard,
  Wallet,
  CalendarDays,
  Scale,
  Repeat,
  FileBarChart,
  ReceiptText,
  Bell,
  Settings,
  Building2,
  Circle,
} from "lucide-react";

const ROLE_LABELS = {
  superadmin: "Directeur général",
  admin: "Administrateur",
  president: "Président",
  secretaire: "Secrétaire",
  tresorier: "Trésorier",
  censeur: "Censeur",
  membre: "Membre",
};

const NAV_ICONS = {
  "": LayoutDashboard,
  dashboard: LayoutDashboard,
  tontines: Building2,
  membres: Users,
  members: Users,
  cotisations: Coins,
  contributions: Coins,
  prets: HandCoins,
  loans: HandCoins,
  paiements: CreditCard,
  payments: CreditCard,
  cash: Wallet,
  reunions: CalendarDays,
  meetings: CalendarDays,
  sanctions: Scale,
  penalties: Scale,
  tours: Repeat,
  turn: Repeat,
  "payout-turns": Repeat,
  reports: FileBarChart,
  receipts: ReceiptText,
  notifications: Bell,
  settings: Settings,
};

function NavIcon({ id }) {
  const Icon = NAV_ICONS[id] || Circle;
  return (
    <span className="tos-nav-icon">
      <Icon strokeWidth={1.9} aria-hidden="true" />
    </span>
  );
}

function SidebarItem({ item, active, onClick }) {
  if (item.section) {
    return <div className="tos-sidebar-section">{item.section}</div>;
  }
  return (
    <button
      type="button"
      className={`tos-nav-item ${active ? "is-active" : ""}`}
      onClick={onClick}
    >
      <NavIcon id={item.id} />
      <span className="tos-nav-label">{item.label}</span>
      {item.badge ? <span className="tos-nav-badge">{item.badge}</span> : null}
    </button>
  );
}

export default function Sidebar({ brand, navItems, activeNav, onNav, user }) {
  const initial = (
    user?.first_name?.[0] ||
    user?.name?.[0] ||
    "T"
  ).toUpperCase();
  const roleLabel = ROLE_LABELS[user?.role] || user?.role;

  return (
    <aside className="tos-sidebar">
      <div className="tos-brand">
        <div className="tos-brand-mark" aria-hidden="true">
          <Building2 size={19} strokeWidth={2.2} />
        </div>
        <div className="tos-brand-txt">
          <strong>{brand || "TontineOS"}</strong>
          <span>Gestion de tontine</span>
        </div>
      </div>

      <nav className="tos-nav">
        {navItems.map((item) => (
          <SidebarItem
            key={item.section || item.id || item.label}
            item={item}
            active={!item.section && item.id === activeNav}
            onClick={() => !item.section && onNav?.(item.id)}
          />
        ))}
      </nav>

      <div className="tos-sidebar-user">
        <div className="tos-user-avatar" aria-hidden="true">
          {initial}
        </div>
        <div className="tos-user-meta">
          <strong>{user?.name || "Utilisateur"}</strong>
          {roleLabel && <span className="tos-role-badge">{roleLabel}</span>}
        </div>
      </div>
    </aside>
  );
}

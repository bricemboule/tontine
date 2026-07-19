import { useEffect, useState } from "react";
import { Bell, LogOut, Sun, Moon } from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { useTheme } from "@/design-system/useTheme";
import TontineSwitcher from "../TontineSwitcher";

export default function Header({
  pageTitle,
  tontineName,
  user,
  onToggleSidebar,
  onLogout,
}) {
  const api = useApi();
  const { theme, toggle } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user || user.role === "superadmin") return;
    api.getNotifications().then(setNotifications).catch(() => {});
  }, [user?.id, user?.role]);

  const unread = notifications.filter((item) => !item.read).length;

  return (
    <header className="tos-header">
      <div className="tos-header-left">
        <button
          type="button"
          className="tos-icon-btn"
          onClick={onToggleSidebar}
          aria-label="Afficher ou masquer le menu"
        >
          <span />
          <span />
          <span />
        </button>
        <div>
          {tontineName && <div className="tos-header-eyebrow">{tontineName}</div>}
          <h1 className="tos-header-title">{pageTitle}</h1>
        </div>
      </div>

      <div className="tos-header-right">
        <button
          type="button"
          className="tos-btn tos-notif-btn"
          onClick={toggle}
          aria-label={theme === "dark" ? "Passer en thème clair" : "Passer en thème sombre"}
        >
          {theme === "dark"
            ? <Sun strokeWidth={1.9} aria-hidden="true" />
            : <Moon strokeWidth={1.9} aria-hidden="true" />}
        </button>

        {user?.role !== "superadmin" && (
          <div className="tos-notif-wrap">
            <button
              type="button"
              className="tos-btn tos-notif-btn"
              aria-label={`Notifications${unread > 0 ? ` (${unread} non lues)` : ""}`}
              aria-expanded={open}
              onClick={() => setOpen((prev) => !prev)}
            >
              <Bell strokeWidth={1.9} aria-hidden="true" />
              {unread > 0 && <span className="tos-notif-badge">{unread}</span>}
            </button>
            {open && (
              <div className="tos-notif-menu">
                {notifications.length === 0 ? (
                  <div className="tos-notif-row">
                    <div className="tos-notif-body">Aucune notification</div>
                  </div>
                ) : (
                  notifications.slice(0, 8).map((item) => (
                    <div key={item.id} className="tos-notif-row">
                      {!item.read && <span className="tos-notif-dot" />}
                      <div style={{ flex: 1 }}>
                        <div className="tos-notif-title">{item.title}</div>
                        <div className="tos-notif-body">{item.body}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        <TontineSwitcher fallbackName={tontineName} role={user?.role} />

        <div className="tos-userbox">
          <div className="tos-user-avatar" aria-hidden="true">
            {(user?.first_name?.[0] || user?.name?.[0] || "T").toUpperCase()}
          </div>
          <div className="tos-user-meta">
            <strong>{user?.name || "Utilisateur"}</strong>
            <span>{user?.email || "session active"}</span>
          </div>
        </div>

        <button type="button" className="tos-btn" onClick={onLogout}>
          <LogOut size={16} strokeWidth={1.9} aria-hidden="true" />
          Déconnexion
        </button>
      </div>
    </header>
  );
}

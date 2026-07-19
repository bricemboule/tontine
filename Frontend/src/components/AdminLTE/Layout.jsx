import { useEffect, useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

/* Coquille applicative unifiée — thème indigo unique (fini l'arc-en-ciel
   par rôle), tokens du design system, DM Sans / Outfit, dark-ready.
   Le rôle est affiché en badge par la Sidebar, plus en couleur globale. */

const SHELL_CSS = `
.tos-adminlte{
  min-height:100vh;
  background:var(--ground);
  color:var(--text);
  font-family:var(--font-body);
}
.tos-shell{
  display:grid;
  grid-template-columns:264px minmax(0,1fr);
  min-height:100vh;
  transition:grid-template-columns .28s ease-in-out;
}
.tos-shell.is-collapsed{ grid-template-columns:76px minmax(0,1fr); }

/* ── Sidebar ────────────────────────────────────────── */
.tos-sidebar{
  display:flex;
  flex-direction:column;
  gap:6px;
  padding:16px 14px;
  background:var(--surface);
  color:var(--text);
  border-right:1px solid var(--border);
  overflow-y:auto;
}
.tos-brand{
  display:flex;
  align-items:center;
  gap:11px;
  padding:8px 8px 14px;
  border-bottom:1px solid var(--border-soft);
  margin-bottom:8px;
}
.tos-brand-mark{
  flex:0 0 auto;
  display:grid;
  place-items:center;
  width:38px;height:38px;
  border-radius:10px;
  background:linear-gradient(140deg,var(--indigo-500),var(--indigo-700));
  color:#fff;font-weight:800;
  box-shadow:0 6px 16px rgba(124,58,237,.32);
}
.tos-brand-txt{min-width:0}
.tos-brand-txt strong{
  display:block;font-family:var(--font-display);font-weight:800;font-size:15px;
  letter-spacing:-.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
.tos-brand-txt span{display:block;margin-top:1px;font-size:11px;color:var(--text-subtle)}

.tos-nav{display:flex;flex-direction:column;gap:3px}
.tos-sidebar-section{
  margin:14px 10px 4px;font-size:10px;font-weight:700;
  letter-spacing:.1em;text-transform:uppercase;color:var(--text-subtle);
}
.tos-nav-item{
  display:flex;align-items:center;gap:11px;
  width:100%;padding:9px 10px;border:0;border-radius:8px;
  background:transparent;color:var(--text-muted);
  text-align:left;font-family:var(--font-body);font-size:13.5px;font-weight:500;
  cursor:pointer;transition:background .14s,color .14s;
}
.tos-nav-item:hover{background:var(--surface-2);color:var(--text)}
.tos-nav-item.is-active{background:var(--primary-soft);color:var(--primary-strong);font-weight:600}
.tos-nav-icon{flex:0 0 auto;display:grid;place-items:center;width:20px;height:20px}
.tos-nav-icon svg{width:18px;height:18px}
.tos-nav-label{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tos-nav-badge{
  margin-left:auto;min-width:20px;padding:1px 7px;border-radius:999px;
  background:var(--primary);color:#fff;font-size:11px;font-weight:700;
  text-align:center;font-variant-numeric:tabular-nums;
}

/* Bloc utilisateur (bas de sidebar) */
.tos-sidebar-user{
  margin-top:auto;display:flex;align-items:center;gap:10px;
  padding-top:12px;border-top:1px solid var(--border-soft);
}
.tos-user-avatar{
  flex:0 0 auto;display:grid;place-items:center;width:36px;height:36px;
  border-radius:50%;background:linear-gradient(135deg,var(--indigo-500),var(--indigo-700));
  color:#fff;font-weight:700;font-size:13px;
}
.tos-user-meta{min-width:0}
.tos-user-meta strong{
  display:block;font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
.tos-role-badge{
  display:inline-flex;align-items:center;margin-top:3px;
  padding:1px 8px;border-radius:999px;font-size:10.5px;font-weight:600;
  color:var(--primary-strong);background:var(--primary-soft);
  border:1px solid var(--primary-softer);
}

/* Rail replié : on masque les libellés */
.tos-shell.is-collapsed .tos-brand-txt,
.tos-shell.is-collapsed .tos-nav-label,
.tos-shell.is-collapsed .tos-nav-badge,
.tos-shell.is-collapsed .tos-sidebar-section,
.tos-shell.is-collapsed .tos-user-meta{display:none}
.tos-shell.is-collapsed .tos-nav-item,
.tos-shell.is-collapsed .tos-brand,
.tos-shell.is-collapsed .tos-sidebar-user{justify-content:center}
.tos-shell.is-collapsed .tos-sidebar-user{margin-top:auto}

/* ── Zone principale ────────────────────────────────── */
.tos-main{display:grid;grid-template-rows:auto 1fr auto;min-width:0}
.tos-header{
  display:flex;align-items:center;justify-content:space-between;gap:16px;
  padding:14px 24px;
  background:color-mix(in srgb, var(--surface) 88%, transparent);
  border-bottom:1px solid var(--border);
  position:sticky;top:0;z-index:20;backdrop-filter:blur(10px);
}
.tos-header-left,.tos-header-right{display:flex;align-items:center;gap:14px}
.tos-header-right{flex-wrap:wrap;justify-content:flex-end}
.tos-header-eyebrow{
  font-size:11px;font-weight:600;color:var(--text-subtle);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:220px;
}
.tos-header-title{
  font-family:var(--font-display);font-weight:700;font-size:21px;line-height:1.15;
  letter-spacing:-.01em;color:var(--text);
}
.tos-icon-btn{
  display:inline-flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;
  width:40px;height:40px;border:1px solid var(--border);border-radius:10px;
  background:var(--surface);cursor:pointer;transition:border-color .16s,background .16s;
}
.tos-icon-btn:hover{border-color:var(--primary);background:var(--surface-2)}
.tos-icon-btn span{display:block;width:16px;height:2px;background:var(--text-muted);border-radius:999px}

.tos-btn{
  display:inline-flex;align-items:center;justify-content:center;gap:8px;
  min-height:40px;padding:0 15px;border:1px solid var(--border);border-radius:10px;
  background:var(--surface);color:var(--text);font-family:var(--font-body);
  font-size:13px;font-weight:600;cursor:pointer;transition:border-color .16s,background .16s,color .16s;
}
.tos-btn:hover{border-color:var(--primary);color:var(--primary-strong)}
.tos-notif-wrap{position:relative}
.tos-notif-btn{width:40px;height:40px;min-height:0;padding:0}
.tos-notif-btn svg{width:18px;height:18px;color:var(--text-muted)}
.tos-notif-badge{
  position:absolute;top:-5px;right:-5px;min-width:18px;height:18px;
  display:grid;place-items:center;padding:0 5px;border-radius:999px;
  background:var(--danger);color:#fff;font-size:10px;font-weight:800;
  border:2px solid var(--surface);
}
.tos-notif-menu{
  position:absolute;right:0;top:48px;width:min(340px,calc(100vw - 32px));
  max-height:360px;overflow:auto;background:var(--surface);
  border:1px solid var(--border);border-radius:12px;box-shadow:var(--shadow-lg);z-index:40;
}
.tos-notif-row{display:flex;gap:10px;padding:12px 14px;border-bottom:1px solid var(--border-soft)}
.tos-notif-row:last-child{border-bottom:none}
.tos-notif-dot{width:7px;height:7px;margin-top:6px;border-radius:999px;background:var(--primary);flex-shrink:0}
.tos-notif-title{font-size:12.5px;font-weight:700;color:var(--text)}
.tos-notif-body{margin-top:2px;font-size:11.5px;color:var(--text-muted);line-height:1.4}

.tos-userbox{
  display:flex;align-items:center;gap:10px;padding:5px 12px 5px 6px;
  border-radius:12px;background:var(--surface-2);border:1px solid var(--border);
}
.tos-userbox .tos-user-avatar{width:32px;height:32px;font-size:12px}
.tos-userbox .tos-user-meta strong{font-size:12.5px}
.tos-userbox .tos-user-meta span{font-size:11px;color:var(--text-subtle)}

.tos-content{padding:24px;min-width:0}
.tos-page{min-width:0;animation:tosFade .25s ease-out}
.tos-footer{
  display:flex;justify-content:space-between;gap:12px;
  padding:14px 24px 20px;font-size:11.5px;color:var(--text-subtle);
}
@keyframes tosFade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@media (prefers-reduced-motion:reduce){.tos-page{animation:none}.tos-shell{transition:none}}

/* ── Responsive : tiroir off-canvas ─────────────────── */
@media (max-width:1080px){
  .tos-shell,.tos-shell.is-collapsed{grid-template-columns:1fr}
  .tos-sidebar{
    position:fixed;top:0;left:0;bottom:0;width:min(272px,84vw);z-index:60;
    transform:translateX(-100%);transition:transform .28s ease;
  }
  .tos-shell.is-mobile-open .tos-sidebar{transform:translateX(0);box-shadow:var(--shadow-lg)}
  .tos-shell.is-collapsed .tos-nav-label,
  .tos-shell.is-collapsed .tos-brand-txt,
  .tos-shell.is-collapsed .tos-user-meta{display:block}
  .tos-backdrop{position:fixed;inset:0;z-index:55;border:0;background:rgba(15,10,22,.5)}
}
@media (min-width:1081px){.tos-backdrop{display:none}}
`;

export default function Layout({
  brand,
  navItems,
  activeNav,
  onNav,
  user,
  pageTitle,
  tontineName,
  onLogout,
  children,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth < 1200) setCollapsed(false);
      if (window.innerWidth > 1080) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const toggleSidebar = () => {
    if (window.innerWidth <= 1080) setMobileOpen((prev) => !prev);
    else setCollapsed((prev) => !prev);
  };

  const handleNav = (id) => {
    setMobileOpen(false);
    onNav?.(id);
  };

  return (
    <div className="tos-adminlte">
      <style>{SHELL_CSS}</style>
      <div className={`tos-shell ${collapsed ? "is-collapsed" : ""} ${mobileOpen ? "is-mobile-open" : ""}`}>
        <Sidebar
          brand={brand}
          navItems={navItems}
          activeNav={activeNav}
          onNav={handleNav}
          user={user}
        />
        {mobileOpen && (
          <button className="tos-backdrop" aria-label="Fermer le menu" onClick={() => setMobileOpen(false)} />
        )}

        <div className="tos-main">
          <Header
            pageTitle={pageTitle}
            tontineName={tontineName}
            user={user}
            onToggleSidebar={toggleSidebar}
            onLogout={onLogout}
          />

          <main className="tos-content">
            <div className="tos-page">{children}</div>
          </main>

          <Footer />
        </div>
      </div>
    </div>
  );
}

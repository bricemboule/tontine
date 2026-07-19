import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ROLE_LABELS = {
  superadmin: "Directeur général",
  admin: "Administrateur",
  president: "Président",
  secretaire: "Secrétaire",
  tresorier: "Trésorier",
  censeur: "Censeur",
  membre: "Membre",
};

// Destination après bascule, alignée sur App.RoleRedirect
const ROLE_HOME = {
  superadmin: "/superadmin/dashboard",
  admin: "/admin/dashboard",
  president: "/president/dashboard",
  secretaire: "/secretary/dashboard",
  tresorier: "/treasurer/dashboard",
  censeur: "/censeur",
  membre: "/member/dashboard",
};

const roleLabel = (r) => ROLE_LABELS[r] || r || "invité";

export default function TontineSwitcher({ fallbackName, role }) {
  const { user, switchTontine } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef(null);

  const memberships = user?.memberships || [];
  const currentId = user?.tontine_id ?? null;

  useEffect(() => {
    const onClickOutside = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const currentName = fallbackName || user?.tontine_name || "Plateforme centrale";

  // Une seule (ou aucune) tontine : pastille statique, comportement inchangé.
  if (memberships.length <= 1) {
    return (
      <div className="tos-pill">
        <strong>{currentName}</strong>
        <span>{roleLabel(role ?? user?.role)}</span>
      </div>
    );
  }

  const onSelect = async (tid) => {
    if (busy || tid === currentId) { setOpen(false); return; }
    setBusy(true);
    try {
      const newRole = await switchTontine(tid);
      setOpen(false);
      navigate(ROLE_HOME[newRole] || "/");
    } catch (err) {
      console.error("Bascule de tontine échouée:", err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={busy}
        className="tos-pill"
        style={{ border: "none", cursor: "pointer", textAlign: "left", display: "grid", gap: 2 }}
        aria-haspopup="listbox"
        aria-expanded={open}
        title="Changer de tontine"
      >
        <strong>{busy ? "Bascule…" : currentName} ⌄</strong>
        <span>{roleLabel(role ?? user?.role)}</span>
      </button>

      {open && (
        <div
          role="listbox"
          style={{
            position: "absolute", right: 0, top: 52, zIndex: 40,
            width: "min(280px, calc(100vw - 32px))", background: "#fff",
            border: "1px solid var(--tos-border, #dee2e6)", borderRadius: 12,
            boxShadow: "0 20px 50px rgba(15,25,35,.18)", overflow: "hidden",
          }}
        >
          <div style={{ padding: "8px 12px", fontSize: 10, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#8292a6" }}>
            Mes tontines
          </div>
          {memberships.map((m) => {
            const active = m.tontine_id === currentId;
            return (
              <button
                key={m.tontine_id}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => onSelect(m.tontine_id)}
                disabled={busy}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  gap: 10, width: "100%", padding: "10px 12px", border: "none",
                  borderTop: "1px solid #f0f2f5", textAlign: "left", cursor: "pointer",
                  background: active ? "var(--tos-accent-soft, #eaf1ff)" : "#fff",
                }}
              >
                <span style={{ display: "grid", gap: 2, minWidth: 0 }}>
                  <strong style={{ fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {m.tontine_name}
                  </strong>
                  <span style={{ fontSize: 10, color: "#7c8ca0", textTransform: "uppercase", letterSpacing: ".06em" }}>
                    {roleLabel(m.role)}
                  </span>
                </span>
                {active && <span style={{ color: "var(--tos-accent, #2563eb)", fontWeight: 800 }}>✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

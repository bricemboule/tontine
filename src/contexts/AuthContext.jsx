import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import {
  apiDownload,
  apiFetch,
  clearStoredTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens as persistTokens,
  tokenExpiresSoon,
} from "../api/http";

// ─────────────────────────────────────────────────────────────
// TontineOS — AuthContext
// Auth JWT réelle connectée au backend FastAPI
// Tokens stockés en localStorage
// Refresh automatique avant expiration
// ─────────────────────────────────────────────────────────────

const AuthContext = createContext(null);

// ── Provider ───────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(null);
  const [token, setToken] = useState(() => getAccessToken());
  const [ready, setReady] = useState(false);

  // Persister les tokens
  const saveTokens = (access, refresh) => {
    persistTokens(access, refresh);
    setToken(access);
  };

  const clearTokens = useCallback(() => {
    clearStoredTokens();
    setToken(null);
    setUser(null);
  }, []);

  // ── Refresh silencieux (sérialisé) ────────────────────────────
  // Un seul refresh en vol à la fois : le refresh token est à usage unique
  // (rotation côté serveur), donc deux appels concurrents déclencheraient la
  // détection de réutilisation et nous déconnecteraient. On mémoïse la promesse.
  const refreshInFlight = useRef(null);
  const doRefresh = useCallback(async () => {
    if (refreshInFlight.current) return refreshInFlight.current;
    const run = (async () => {
      const rt = getRefreshToken();
      if (!rt) { clearTokens(); return null; }
      try {
        const data = await apiFetch("/auth/refresh", {
          method: "POST",
          body: { refresh_token: rt },
        });
        persistTokens(data.access_token, data.refresh_token);
        setToken(data.access_token);
        return data.access_token;
      } catch {
        clearTokens();
        return null;
      } finally {
        refreshInFlight.current = null;
      }
    })();
    refreshInFlight.current = run;
    return run;
  }, [clearTokens]);

  // ── authFetch : fetch avec token + refresh auto ───────────────
  const authFetch = useCallback(async (path, options = {}) => {
    let tk = getAccessToken();
    if (!tk) throw new Error("Non authentifié");
    if (tokenExpiresSoon(tk)) {
      tk = await doRefresh();
      if (!tk) throw new Error("Session expirée — reconnectez-vous");
    }
    return apiFetch(path, {
      ...options,
      headers: { Authorization: `Bearer ${tk}`, ...options.headers },
    });
  }, [doRefresh]);

  // ── authDownload : comme authFetch mais renvoie la réponse brute (binaire) ──
  const authDownload = useCallback(async (path, options = {}) => {
    let tk = getAccessToken();
    if (!tk) throw new Error("Non authentifié");
    if (tokenExpiresSoon(tk)) {
      tk = await doRefresh();
      if (!tk) throw new Error("Session expirée — reconnectez-vous");
    }
    return apiDownload(path, tk, options);
  }, [doRefresh]);

  // ── Restaurer la session au démarrage ─────────────────────────
  useEffect(() => {
    const stored = getAccessToken();
    if (!stored) { setReady(true); return; }

    (async () => {
      try {
        let tk = stored;
        if (tokenExpiresSoon(tk)) {
          tk = await doRefresh();
          if (!tk) { setReady(true); return; }
        }
        const me = await apiFetch("/auth/me", {
          headers: { Authorization: `Bearer ${tk}` },
        });
        setUser(me);
      } catch {
        clearTokens();
      } finally {
        setReady(true);
      }
    })();
  }, []);

  // ── Refresh automatique toutes les 60s ────────────────────────
  useEffect(() => {
    if (!token) return;
    const id = setInterval(() => {
      if (tokenExpiresSoon(token, 150)) doRefresh();
    }, 60_000);
    return () => clearInterval(id);
  }, [token, doRefresh]);

  // ── Login ─────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    saveTokens(data.access_token, data.refresh_token);
    setUser(data.user);
    return data.user.role;
  }, []);

  // ── Login Google ──────────────────────────────────────────────
  const googleLogin = useCallback(async (accessToken) => {
    const data = await apiFetch("/auth/google", {
      method: "POST",
      body: { access_token: accessToken },
    });
    saveTokens(data.access_token, data.refresh_token);
    setUser(data.user);
    return data.user.role;
  }, []);

  // ── Changement de tontine active ──────────────────────────────
  // Ré-émet un token dont le rôle est celui de l'utilisateur DANS la tontine
  // choisie. Renvoie le nouveau rôle pour permettre la redirection.
  const switchTontine = useCallback(async (tontineId) => {
    const rt = getRefreshToken();
    const data = await authFetch("/auth/switch-tontine", {
      method: "POST",
      body: { tontine_id: tontineId, refresh_token: rt },
    });
    persistTokens(data.access_token, data.refresh_token);
    setToken(data.access_token);
    setUser(data.user);
    return data.user.role;
  }, [authFetch]);

  // ── Logout ────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    const rt = getRefreshToken();
    if (rt) {
      // Révocation serveur du refresh token (best-effort)
      try { await apiFetch("/auth/logout", { method: "POST", body: { refresh_token: rt } }); }
      catch { /* déconnexion locale garantie ci-dessous */ }
    }
    clearTokens();
  }, [clearTokens]);

  // ── Changement de mot de passe ────────────────────────────────
  const changePassword = useCallback(async (current_password, new_password) => {
    return authFetch("/auth/me/password", {
      method: "PUT",
      body: { current_password, new_password },
    });
  }, [authFetch]);

  // Écran de chargement pendant la vérification initiale du token
  if (!ready) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "#f4f6fa",
        fontFamily: "system-ui, sans-serif", color: "#94a3b8", fontSize: 14
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 32, height: 32, border: "3px solid #e2e8f0",
            borderTop: "3px solid #1d6ef5", borderRadius: "50%",
            animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }}/>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          Vérification de la session…
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, login, googleLogin, logout, changePassword, switchTontine, authFetch, authDownload }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

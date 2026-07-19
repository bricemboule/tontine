import { useEffect, useRef, useState } from "react";
import { routeForRole } from "../constants";

export function useGoogleLogin({ googleLogin, navigate, setError }) {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
  const googleTokenClient = useRef(null);
  const [googleReady, setGoogleReady] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (!googleClientId) return;

    let cancelled = false;

    const initGoogle = () => {
      if (cancelled || !window.google?.accounts?.oauth2) return;

      googleTokenClient.current = window.google.accounts.oauth2.initTokenClient({
        client_id: googleClientId,
        scope: "openid email profile",
        callback: async (response) => {
          if (response.error || !response.access_token) {
            setError("Connexion Google annulée ou refusée.");
            setGoogleLoading(false);
            return;
          }

          setError("");
          setGoogleLoading(true);
          try {
            const role = await googleLogin(response.access_token);
            navigate(routeForRole(role));
          } catch (err) {
            setError(err.message || "Impossible de vous connecter avec Google.");
          } finally {
            setGoogleLoading(false);
          }
        },
      });
      setGoogleReady(true);
    };

    if (window.google?.accounts?.oauth2) {
      initGoogle();
      return () => {
        cancelled = true;
      };
    }

    const existingScript = document.getElementById("google-identity-services");
    if (existingScript) {
      existingScript.addEventListener("load", initGoogle, { once: true });
      return () => {
        cancelled = true;
        existingScript.removeEventListener("load", initGoogle);
      };
    }

    const script = document.createElement("script");
    script.id = "google-identity-services";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initGoogle;
    script.onerror = () => {
      if (!cancelled) {
        setError("Impossible de charger Google Identity Services.");
      }
    };
    document.head.appendChild(script);

    return () => {
      cancelled = true;
    };
  }, [googleClientId, googleLogin, navigate, setError]);

  const requestGoogleLogin = () => {
    setError("");

    if (!googleClientId) {
      setError("Connexion Google non configurée. Renseignez VITE_GOOGLE_CLIENT_ID.");
      return;
    }

    if (!googleReady || !googleTokenClient.current) {
      setError("Google est en cours de chargement. Réessayez dans quelques secondes.");
      return;
    }

    googleTokenClient.current.requestAccessToken({ prompt: "select_account" });
  };

  return {
    googleLoading,
    requestGoogleLogin,
  };
}

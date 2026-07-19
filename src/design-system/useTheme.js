import { useCallback, useEffect, useState } from "react";

/* Gestion du thème clair/sombre. Le thème est piloté par l'attribut
   [data-theme] sur <html> ; les tokens (design system + legacy) s'y
   adaptent. Persisté dans localStorage. */

const KEY = "tos-theme";

function systemPref() {
  return typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

/* Appelé une fois au démarrage (main.jsx) pour éviter le flash. */
export function initTheme() {
  const saved = typeof localStorage !== "undefined" ? localStorage.getItem(KEY) : null;
  applyTheme(saved === "light" || saved === "dark" ? saved : systemPref());
}

export function useTheme() {
  const [theme, setThemeState] = useState(() =>
    typeof document !== "undefined"
      ? document.documentElement.getAttribute("data-theme") || "light"
      : "light"
  );

  const setTheme = useCallback((next) => {
    applyTheme(next);
    try { localStorage.setItem(KEY, next); } catch { /* stockage indisponible */ }
    setThemeState(next);
  }, []);

  const toggle = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  // Suit la préférence système tant que l'utilisateur n'a pas choisi.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const saved = localStorage.getItem(KEY);
      if (saved === "light" || saved === "dark") return;
      const next = mq.matches ? "dark" : "light";
      applyTheme(next);
      setThemeState(next);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return { theme, setTheme, toggle };
}

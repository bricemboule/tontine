/** @type {import('tailwindcss').Config} */

// Échelle indigo — miroir statique de src/design-system/tokens.css.
// Sert aux utilitaires d'accent (bg-primary-600…), stable dans les deux thèmes.
const indigo = {
  50: "#F5F3FF",
  100: "#EDE9FE",
  200: "#DDD6FE",
  300: "#C4B5FD",
  400: "#A78BFA",
  500: "#8B5CF6",
  600: "#7C3AED",
  700: "#6D28D9",
  800: "#5B21B6",
  900: "#4C1D95",
};

export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        display: ["Outfit", "system-ui", "sans-serif"],
      },
      colors: {
        // Marque unique. `brand` conservé comme alias pour compat existante.
        primary: indigo,
        brand: indigo,
        neutral: {
          50: "#FAF9FC",
          100: "#F4F2F8",
          200: "#E9E6F0",
          300: "#D6D2E1",
          400: "#A9A3B9",
          500: "#7C7691",
          600: "#5C5670",
          700: "#423D54",
          800: "#2A2637",
          900: "#191622",
        },
        // Sémantique — distincte de l'accent.
        success: { DEFAULT: "#16A34A", soft: "var(--success-soft)", border: "var(--success-border)" },
        warning: { DEFAULT: "#D97706", soft: "var(--warning-soft)", border: "var(--warning-border)" },
        danger:  { DEFAULT: "#DC2626", soft: "var(--danger-soft)",  border: "var(--danger-border)" },
        info:    { DEFAULT: "#2563EB", soft: "var(--info-soft)",    border: "var(--info-border)" },
        // Tokens de surface pilotés par variables → dark-ready automatique.
        ground: "var(--ground)",
        surface: { DEFAULT: "var(--surface)", 2: "var(--surface-2)" },
        line: { DEFAULT: "var(--border)", soft: "var(--border-soft)" },
        ink: { DEFAULT: "var(--text)", muted: "var(--text-muted)", subtle: "var(--text-subtle)" },
      },
      borderRadius: {
        sm: "7px",
        DEFAULT: "10px",
        md: "10px",
        lg: "14px",
        xl: "20px",
      },
      boxShadow: {
        xs: "var(--shadow-sm)",
        card: "var(--shadow-md)",
        pop: "var(--shadow-lg)",
        "login-card": "0 28px 90px rgba(15, 23, 42, 0.12)",
        "soft-purple": "0 18px 40px rgba(124, 58, 237, 0.28)",
      },
      ringColor: {
        brand: "var(--ring)",
      },
    },
  },
  plugins: [],
};

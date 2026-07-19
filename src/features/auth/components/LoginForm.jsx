import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button, InputField } from "@/design-system";
import SocialButton from "@/components/ui/SocialButton";
import { routeForRole } from "../constants";
import { useGoogleLogin } from "../hooks/useGoogleLogin";
import { GoogleIcon, MicrosoftIcon } from "./SocialIcons";

export default function LoginForm() {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { googleLoading, requestGoogleLogin } = useGoogleLogin({ googleLogin, navigate, setError });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Veuillez renseigner votre adresse e-mail et votre mot de passe.");
      return;
    }

    setLoading(true);
    try {
      const role = await login(email.trim(), password);
      navigate(routeForRole(role));
    } catch (err) {
      setError(err.message || "Impossible de vous connecter pour le moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative z-10 w-full max-w-[520px] rounded-xl border border-line bg-surface px-6 py-8 shadow-login-card sm:px-10 sm:py-11 lg:px-12 lg:py-12">
      <div className="mb-9 text-center">
        <div className="mx-auto flex h-[86px] w-[86px] items-center justify-center rounded-full bg-primary-100">
          <Users className="h-10 w-10 text-primary-600" fill="#7C3AED" fillOpacity={0.18} strokeWidth={2.4} />
        </div>
        <h2 className="mt-8 font-display text-[29px] font-extrabold leading-tight tracking-tight text-ink">
          Bienvenue !
        </h2>
        <p className="mt-3 text-[16px] font-medium text-ink-muted">
          Connectez-vous à votre espace TontineOS
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField
          label="Adresse e-mail"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Entrez votre adresse e-mail"
          icon={Mail}
          autoComplete="email"
          autoFocus
          error={Boolean(error && !email.trim())}
        />

        <InputField
          label="Mot de passe"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Entrez votre mot de passe"
          icon={Lock}
          autoComplete="current-password"
          error={Boolean(error && !password)}
          endAdornment={
            <button
              type="button"
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              onClick={() => setShowPassword((value) => !value)}
              className="rounded-full p-1 text-ink-muted transition hover:bg-primary-50 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-brand"
            >
              {showPassword ? <EyeOff className="h-5 w-5" strokeWidth={2} /> : <Eye className="h-5 w-5" strokeWidth={2} />}
            </button>
          }
        />

        {error && (
          <div className="flex items-start gap-2 rounded-md border border-danger-border bg-danger-soft px-4 py-3 text-[13px] font-semibold text-danger">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true" className="mt-px shrink-0">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-3 text-[13px] font-semibold text-ink">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              className="h-[18px] w-[18px] rounded border-line accent-primary-600 focus:ring-brand"
            />
            Se souvenir de moi
          </label>
          <a href="#" className="text-[13px] font-bold text-primary-600 transition hover:text-primary-700">
            Mot de passe oublié ?
          </a>
        </div>

        <Button type="submit" size="xl" fullWidth loading={loading} iconLeft={<Lock className="h-5 w-5" strokeWidth={2.5} />}>
          {loading ? "Connexion…" : "Se connecter"}
        </Button>
      </form>

      <div className="my-8 flex items-center gap-4">
        <span className="h-px flex-1 bg-line" />
        <span className="text-[13px] font-medium text-ink-subtle">ou continuer avec</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <div className="space-y-3">
        <SocialButton icon={<GoogleIcon />} onClick={requestGoogleLogin} disabled={googleLoading}>
          {googleLoading ? "Connexion Google…" : "Continuer avec Google"}
        </SocialButton>
        <SocialButton icon={<MicrosoftIcon />} disabled>
          Continuer avec Microsoft
        </SocialButton>
      </div>

      <p className="mt-9 text-center text-[15px] font-medium leading-7 text-ink">
        Vous n’avez pas de compte ?
        <br />
        <a href="mailto:admin@tontine.cm" className="font-bold text-primary-600 transition hover:text-primary-700">
          Contactez votre administrateur
        </a>
      </p>

      <div className="pointer-events-none absolute -right-5 -top-5 hidden h-16 w-16 rounded-full border border-primary-100 sm:block" />
      <ShieldCheck aria-hidden="true" className="pointer-events-none absolute -bottom-4 -left-4 hidden h-12 w-12 text-primary-100 sm:block" strokeWidth={1.3} />
    </section>
  );
}

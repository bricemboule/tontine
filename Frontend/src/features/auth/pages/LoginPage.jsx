import AuthBrandPanel from "../components/AuthBrandPanel";
import LoginForm from "../components/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-surface p-0 text-ink lg:p-6">
      <div className="mx-auto flex min-h-screen w-full overflow-hidden bg-ground shadow-[0_18px_65px_rgba(15,23,42,0.12)] lg:min-h-[calc(100vh-48px)] lg:rounded-[28px] lg:border lg:border-line">
        <AuthBrandPanel />

        <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-ground px-5 py-8 sm:px-8 lg:min-h-full lg:w-1/2 lg:px-10">
          <div
            aria-hidden="true"
            className="absolute right-8 top-8 hidden grid-cols-5 gap-3 opacity-70 md:grid"
          >
            {Array.from({ length: 35 }).map((_, index) => (
              <span key={index} className="h-1 w-1 rounded-full bg-primary-400" />
            ))}
          </div>
          <div
            aria-hidden="true"
            className="absolute -bottom-28 -right-28 h-72 w-72 rounded-full border border-primary-200"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-14 -right-14 h-48 w-48 rounded-full border border-primary-100"
          />

          <LoginForm />
        </section>
      </div>
    </main>
  );
}

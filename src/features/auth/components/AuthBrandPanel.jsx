import {
  BarChart3,
  CreditCard,
  FileText,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";

const benefits = [
  { icon: Users, label: "Gestion complète des membres" },
  { icon: Wallet, label: "Suivi des cotisations et paiements" },
  { icon: BarChart3, label: "Rapports et statistiques détaillés" },
  { icon: ShieldCheck, label: "Sécurisé et accessible partout" },
];

function DotGrid({ className }) {
  return (
    <div
      aria-hidden="true"
      className={[
        "grid grid-cols-6 gap-3 opacity-70",
        className,
      ].join(" ")}
    >
      {Array.from({ length: 36 }).map((_, index) => (
        <span key={index} className="h-1 w-1 rounded-full bg-brand-500" />
      ))}
    </div>
  );
}

function LogoMark() {
  return (
    <div
      className="flex h-12 w-12 items-center justify-center border-2 border-white bg-white/5"
      style={{
        clipPath:
          "polygon(50% 3%, 93% 26%, 93% 74%, 50% 97%, 7% 74%, 7% 26%)",
      }}
    >
      <Users className="h-6 w-6 text-white" strokeWidth={2.3} />
    </div>
  );
}

function DashboardIllustration() {
  return (
    <div className="relative mt-auto min-h-[280px] w-full">
      <div className="absolute bottom-2 left-3 hidden items-end gap-3 xl:flex">
        <div className="h-20 w-16 rounded-[50%_50%_12px_12px] bg-[#AE7AFF]/80" />
        <div className="h-24 w-8 rounded-full bg-[#24104E]" />
        <div className="h-9 w-9 rounded-full bg-[#22113F]" />
      </div>

      <div className="absolute bottom-0 left-[22%] h-[220px] w-[430px] max-w-[68%] rotate-[-10deg] rounded-[18px] border border-white/40 bg-[#C8C7E8] p-3 shadow-[0_25px_70px_rgba(0,0,0,0.42)]">
        <div className="h-full rounded-[12px] border border-[#4C3D85]/30 bg-[#2B2352] p-2">
          <div className="h-full rounded-[9px] bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-md bg-brand-600" />
                <div className="h-2 w-16 rounded-full bg-[#DAD7EF]" />
              </div>
              <div className="flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-brand-200" />
                <span className="h-2 w-2 rounded-full bg-brand-300" />
                <span className="h-2 w-2 rounded-full bg-brand-500" />
              </div>
            </div>
            <div className="grid h-[122px] grid-cols-[1.05fr_1fr_1.1fr] gap-3">
              <div className="space-y-3">
                <div className="h-16 rounded-xl bg-brand-600/90 p-3">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <div className="h-3 w-20 rounded-full bg-brand-200" />
                <div className="h-3 w-14 rounded-full bg-[#E7E5F6]" />
              </div>
              <div className="space-y-3">
                <div className="flex h-16 items-end gap-2 rounded-xl bg-[#F2F0FF] px-3 pb-3">
                  <span className="h-5 w-4 rounded-t bg-brand-300" />
                  <span className="h-9 w-4 rounded-t bg-brand-500" />
                  <span className="h-12 w-4 rounded-t bg-brand-600" />
                </div>
                <div className="h-3 w-24 rounded-full bg-[#E7E5F6]" />
                <div className="h-3 w-16 rounded-full bg-[#E7E5F6]" />
              </div>
              <div className="space-y-3">
                <div className="h-9 rounded-lg bg-[#F5F3FF]" />
                <div className="h-9 rounded-lg bg-[#F5F3FF]" />
                <div className="h-9 rounded-lg bg-[#F5F3FF]" />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-12 left-16 right-16 h-14 rounded-b-[26px] bg-[#B9B8DB] shadow-[0_18px_38px_rgba(0,0,0,0.35)]" />
      </div>

      <div className="absolute bottom-12 right-[13%] h-[172px] w-[78px] rotate-[-8deg] rounded-[20px] border border-white/50 bg-[#1C1644] p-2 shadow-[0_22px_42px_rgba(0,0,0,0.42)]">
        <div className="h-full rounded-[14px] bg-white px-2 py-3">
          <div className="mx-auto mb-3 h-1.5 w-8 rounded-full bg-[#C8C4E8]" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <span className="h-4 w-4 rounded-full bg-brand-500" />
                <span className="h-2 flex-1 rounded-full bg-[#E7E5F6]" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-11 right-6 hidden h-20 w-16 flex-col-reverse items-center gap-1 md:flex">
        {Array.from({ length: 7 }).map((_, index) => (
          <span
            key={index}
            className="h-3 w-14 rounded-full border border-white/20 bg-brand-500 shadow-[0_8px_18px_rgba(124,58,237,0.35)]"
          />
        ))}
      </div>
    </div>
  );
}

export default function AuthBrandPanel() {
  return (
    <aside className="relative hidden min-h-full w-1/2 overflow-hidden bg-gradient-to-br from-[#1E0B4F] via-[#180040] to-[#020617] px-12 py-14 text-white lg:flex xl:px-20">
      <DotGrid className="absolute left-8 top-8" />
      <div
        aria-hidden="true"
        className="absolute -right-32 -top-44 h-[420px] w-[420px] rounded-full border border-white/10"
      />
      <div
        aria-hidden="true"
        className="absolute -right-20 -top-28 h-[300px] w-[300px] rounded-full border border-white/5"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-28 right-32 h-24 w-24 rounded-full bg-brand-600/10 blur-2xl"
      />

      <div className="relative z-10 flex h-full min-h-[720px] w-full max-w-[660px] flex-col">
        <div className="flex items-center gap-4">
          <LogoMark />
          <div>
            <p className="font-display text-[31px] font-extrabold leading-none tracking-[0]">
              TontinePro
            </p>
            <p className="mt-1 text-[15px] font-medium tracking-[0] text-white/90">
              Gestion de tontines simplifiée
            </p>
          </div>
        </div>

        <div className="mt-24 max-w-[600px]">
          <h1 className="font-display text-[41px] font-extrabold leading-[1.18] tracking-[0] text-white xl:text-[48px]">
            La solution complète
            <br />
            pour gérer{" "}
            <span className="text-[#A970FF]">vos tontines</span>
            <br />
            en toute simplicité
          </h1>
          <div className="mt-8 h-1 w-12 rounded-full bg-[#A970FF]" />
          <p className="mt-6 max-w-[440px] text-[17px] font-medium leading-8 tracking-[0] text-white/[0.92]">
            Gérez vos membres, cotisations, paiements, réunions et rapports
            depuis une seule plateforme sécurisée.
          </p>
        </div>

        <div className="mt-9 space-y-4">
          {benefits.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 shadow-[0_10px_22px_rgba(124,58,237,0.38)]">
                <Icon className="h-[18px] w-[18px] text-white" strokeWidth={2.4} />
              </span>
              <span className="text-[15px] font-medium tracking-[0] text-white">
                {label}
              </span>
            </div>
          ))}
        </div>

        <DashboardIllustration />
      </div>
    </aside>
  );
}

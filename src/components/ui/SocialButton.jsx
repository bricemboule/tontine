export default function SocialButton({ children, icon, onClick, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-14 w-full items-center justify-center gap-4 rounded-xl border border-[#D8DEE9] bg-white px-5 text-[15px] font-bold tracking-[0] text-[#111827] transition hover:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="flex h-6 w-6 items-center justify-center">{icon}</span>
      <span>{children}</span>
    </button>
  );
}

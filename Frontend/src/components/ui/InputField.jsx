export default function InputField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  icon: Icon,
  endAdornment,
  autoComplete,
  autoFocus = false,
  error = false,
}) {
  return (
    <div className="space-y-2">
      <label className="block text-[13px] font-bold tracking-[0] text-[#111827]">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#4F4A86]"
            strokeWidth={1.8}
          />
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          className={[
            "h-14 w-full rounded-xl border bg-white text-[15px] font-medium tracking-[0] text-[#111827] outline-none transition",
            "placeholder:text-[#66708F]",
            "focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20",
            Icon ? "pl-12" : "pl-4",
            endAdornment ? "pr-12" : "pr-4",
            error ? "border-red-300 ring-2 ring-red-100" : "border-[#D8DEE9]",
          ].join(" ")}
        />
        {endAdornment && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {endAdornment}
          </div>
        )}
      </div>
    </div>
  );
}

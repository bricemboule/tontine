export function Field({
  label,
  as,
  children,
  type = "text",
  className = "",
  ...props
}) {
  const Tag = as === "textarea" ? "textarea" : as === "select" ? "select" : "input";

  return (
    <label className={`field ${className}`}>
      {label ? <span className="field-label">{label}</span> : null}
      <Tag className="field-input" type={Tag === "input" ? type : undefined} {...props}>
        {children}
      </Tag>
    </label>
  );
}

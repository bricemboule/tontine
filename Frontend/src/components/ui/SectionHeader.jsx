export function SectionHeader({ title, sub, children }) {
  return (
    <div className="section-head">
      <div>
        <h2>{title}</h2>
        {sub ? <p>{sub}</p> : null}
      </div>
      {children ? <div className="section-actions">{children}</div> : null}
    </div>
  );
}

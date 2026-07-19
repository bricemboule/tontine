export default function Panel({ title, action, children }) {
  return (
    <section className="dash-card">
      <div className="dash-card-header">
        <h2 className="dash-card-title">{title}</h2>
        {action ? <button className="dash-card-action" type="button">{action}</button> : null}
      </div>
      <div className="dash-card-body">{children}</div>
    </section>
  );
}

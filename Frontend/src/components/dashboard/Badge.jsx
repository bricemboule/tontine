export default function Badge({ children, status = "default" }) {
  return <span className={`dash-badge ${status}`}>{children}</span>;
}

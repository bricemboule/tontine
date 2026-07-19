import { Empty } from "./Empty";

export function ListCard({ headers = [], rows = [], emptyIcon, emptyMsg }) {
  return (
    <div className="card">
      {headers.length ? (
        <div className="list-card-head" style={{ gridTemplateColumns: `repeat(${headers.length}, minmax(0, 1fr))` }}>
          {headers.map((header) => (
            <span key={header} style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--t3)" }}>
              {header}
            </span>
          ))}
        </div>
      ) : null}
      {rows.length ? rows : <Empty icon={emptyIcon} msg={emptyMsg} />}
    </div>
  );
}

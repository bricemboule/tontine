import { Empty } from "./Empty";
import { fmtCFA } from "./formatters";

export function CashflowChart({ data = [] }) {
  const values = data.map((item) => Number(item?.value || item?.amount || 0));
  const max = Math.max(1, ...values);

  return (
    <div className="cashflow">
      {data.length === 0 ? (
        <Empty icon="◈" msg="Aucun flux disponible" />
      ) : (
        data.map((item, index) => {
          const value = Number(item?.value || item?.amount || 0);
          return (
            <div key={item?.label || index} className="cashflow-bar">
              <span style={{ fontSize: 11, color: "var(--t2)" }}>{item?.label || `P${index + 1}`}</span>
              <div className="cashflow-track">
                <div className="cashflow-fill" style={{ width: `${Math.max(6, (value / max) * 100)}%` }} />
              </div>
              <strong style={{ fontSize: 11, textAlign: "right" }}>{fmtCFA(value)}</strong>
            </div>
          );
        })
      )}
    </div>
  );
}

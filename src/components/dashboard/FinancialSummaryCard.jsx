export default function FinancialSummaryCard({ items = [] }) {
  return (
    <div className="dash-financial-list">
      {items.map(item => (
        <div key={item.label}>
          <div className="dash-financial-label">{item.label}</div>
          <div className="dash-financial-value">{item.value}</div>
        </div>
      ))}
    </div>
  );
}

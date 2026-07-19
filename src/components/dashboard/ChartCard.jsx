function LineChart({ color }) {
  const gradientId = `dash-line-${String(color).replace("#", "")}`;

  return (
    <div className="dash-line-chart">
      <svg viewBox="0 0 680 240" role="img" aria-label="Graphique mocké">
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity=".34" />
            <stop offset="100%" stopColor={color} stopOpacity=".04" />
          </linearGradient>
        </defs>
        {[44, 88, 132, 176].map(y => (
          <line key={y} x1="14" x2="666" y1={y} y2={y} stroke="#e2e8f0" strokeDasharray="5 6" />
        ))}
        <path
          d="M18 192 C74 160 94 136 138 112 C182 86 198 118 238 120 C286 124 300 88 342 74 C386 58 420 58 456 46 C496 34 520 18 560 36 C602 54 618 98 662 52 L662 224 L18 224 Z"
          fill={`url(#${gradientId})`}
        />
        <path
          d="M18 192 C74 160 94 136 138 112 C182 86 198 118 238 120 C286 124 300 88 342 74 C386 58 420 58 456 46 C496 34 520 18 560 36 C602 54 618 98 662 52"
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
        />
        {["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"].map((month, index) => (
          <text key={month} x={24 + index * 57} y="235" fill="#64748b" fontSize="12">{month}</text>
        ))}
      </svg>
    </div>
  );
}

function DonutChart({ color }) {
  return (
    <div className="dash-donut-wrap">
      <div className="dash-donut" style={{ "--dash-primary": color }} />
      <div className="dash-legend">
        <div className="dash-legend-row"><span>Encaissé</span><strong>62%</strong></div>
        <div className="dash-legend-row"><span>En retard</span><strong>12%</strong></div>
        <div className="dash-legend-row"><span>Partiel</span><strong>6%</strong></div>
      </div>
    </div>
  );
}

export default function ChartCard({ type = "line", color }) {
  return type === "donut" ? <DonutChart color={color} /> : <LineChart color={color} />;
}

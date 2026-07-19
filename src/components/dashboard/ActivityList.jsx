export default function ActivityList({ items = [], alertMode = false }) {
  if (alertMode) {
    return (
      <div className="dash-alert-list">
        {items.map(item => (
          <div key={item.text} className={`dash-alert ${item.type || ""}`}>
            <span>{item.icon || "△"}</span>
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="dash-activity-list">
      {items.map(item => (
        <div className="dash-activity-item" key={item.text}>
          <span className="dash-activity-dot">{item.icon || "i"}</span>
          <span className="dash-activity-text">{item.text}</span>
          {item.time ? <span className="dash-activity-time">{item.time}</span> : null}
        </div>
      ))}
    </div>
  );
}

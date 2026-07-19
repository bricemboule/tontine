import QuickActionButton from "./QuickActionButton";

export default function QuickActionsPanel({ actions = [] }) {
  return (
    <div className="dash-quick-actions">
      {actions.map(action => (
        <QuickActionButton key={action.label} {...action} />
      ))}
    </div>
  );
}

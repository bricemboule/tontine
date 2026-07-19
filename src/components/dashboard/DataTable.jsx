import Badge from "./Badge";
import EmptyState from "./EmptyState";

function renderCell(cell) {
  if (cell && typeof cell === "object" && cell.badge) {
    return <Badge status={cell.status}>{cell.label}</Badge>;
  }
  if (cell && typeof cell === "object" && cell.action) {
    return <button className="dash-card-action" type="button">{cell.label}</button>;
  }
  return cell;
}

export default function DataTable({ columns = [], rows = [], empty = "Aucune donnée" }) {
  if (!rows.length) return <EmptyState message={empty} />;

  return (
    <div className="dash-table-wrap">
      <table className="dash-table">
        <thead>
          <tr>{columns.map(column => <th key={column}>{column}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={row.id || rowIndex}>
              {columns.map(column => (
                <td key={column}>{renderCell(row[column])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

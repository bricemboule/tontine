import DataTable from "./DataTable";

export default function RecentPaymentsTable({ rows = [] }) {
  return (
    <DataTable
      columns={["Membre", "Montant", "Méthode", "Date", "Reçu"]}
      rows={rows}
      empty="Aucun paiement récent"
    />
  );
}

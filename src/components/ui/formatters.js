export function fmtCFA(value) {
  const amount = Number(value || 0);
  return `${new Intl.NumberFormat("fr-FR").format(amount)} XAF`;
}

export function fmtDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

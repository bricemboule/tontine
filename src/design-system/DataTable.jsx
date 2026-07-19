import { useMemo, useState } from "react";
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { cn } from "./cn";

/* DataTable du design system.
   columns : [{ key, header, render(row), align, width, sortable, sortValue(row) }]
   Fonctions : recherche, tri client, pagination, skeleton de chargement, empty state.
   Remplace les fausses tables en grilles inline (SHARED_CSS). */

function SortIcon({ dir }) {
  if (dir === "asc") return <ChevronUp size={14} strokeWidth={2.4} />;
  if (dir === "desc") return <ChevronDown size={14} strokeWidth={2.4} />;
  return <ChevronDown size={14} strokeWidth={2.4} className="opacity-30" />;
}

export function DataTable({
  columns,
  data = [],
  rowKey = (row, i) => row.id ?? i,
  onRowClick,
  loading = false,
  searchable = false,
  searchKeys = [],
  searchPlaceholder = "Rechercher…",
  pageSize = 0,
  empty = {},
  toolbar = null,
  className = "",
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState({ key: null, dir: null });
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    if (!searchable || !query.trim()) return data;
    const q = query.trim().toLowerCase();
    const keys = searchKeys.length ? searchKeys : columns.map((c) => c.key);
    return data.filter((row) =>
      keys.some((k) => String(row[k] ?? "").toLowerCase().includes(q))
    );
  }, [data, query, searchable, searchKeys, columns]);

  const sorted = useMemo(() => {
    if (!sort.key || !sort.dir) return filtered;
    const col = columns.find((c) => c.key === sort.key);
    const getVal = col?.sortValue || ((row) => row[sort.key]);
    return [...filtered].sort((a, b) => {
      const va = getVal(a), vb = getVal(b);
      if (va == null) return 1;
      if (vb == null) return -1;
      const cmp = typeof va === "number" && typeof vb === "number"
        ? va - vb
        : String(va).localeCompare(String(vb), "fr", { numeric: true });
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sort, columns]);

  const totalPages = pageSize > 0 ? Math.ceil(sorted.length / pageSize) : 1;
  const safePage = Math.min(page, Math.max(0, totalPages - 1));
  const paged = pageSize > 0 ? sorted.slice(safePage * pageSize, safePage * pageSize + pageSize) : sorted;

  const toggleSort = (col) => {
    if (!col.sortable) return;
    setSort((prev) => {
      if (prev.key !== col.key) return { key: col.key, dir: "asc" };
      if (prev.dir === "asc") return { key: col.key, dir: "desc" };
      return { key: null, dir: null };
    });
  };

  const EmptyIcon = empty.icon || Inbox;
  const showToolbar = searchable || toolbar;

  return (
    <div className={cn("overflow-hidden rounded-lg border border-line bg-surface shadow-xs", className)}>
      {showToolbar && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
          {searchable ? (
            <div className="relative flex items-center">
              <Search size={16} strokeWidth={2} className="pointer-events-none absolute left-3 text-ink-subtle" />
              <input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(0); }}
                placeholder={searchPlaceholder}
                className="h-9 w-64 max-w-full rounded-md border border-line bg-surface pl-9 pr-3 text-sm text-ink outline-none placeholder:text-ink-subtle focus:border-primary-500 focus:ring-2 focus:ring-brand"
              />
            </div>
          ) : <span />}
          {toolbar}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          {columns.some((c) => c.width) && (
            <colgroup>
              {columns.map((c) => <col key={c.key} style={c.width ? { width: c.width } : undefined} />)}
            </colgroup>
          )}
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col)}
                  className={cn(
                    "whitespace-nowrap border-b border-line bg-surface-2 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.06em] text-ink-subtle",
                    col.align === "right" ? "text-right" : "text-left",
                    col.sortable && "cursor-pointer select-none hover:text-ink"
                  )}
                >
                  <span className={cn("inline-flex items-center gap-1", col.align === "right" && "flex-row-reverse")}>
                    {col.header}
                    {col.sortable && <SortIcon dir={sort.key === col.key ? sort.dir : null} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`sk-${i}`} className="border-b border-line-soft last:border-0">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3.5">
                      <span className="block h-3.5 animate-pulse rounded bg-line" style={{ width: `${40 + ((i * 13 + col.key.length * 7) % 45)}%` }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-14">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-surface-2 text-ink-subtle">
                      <EmptyIcon size={22} strokeWidth={1.8} />
                    </span>
                    <p className="text-sm font-semibold text-ink">{empty.title || "Aucune donnée"}</p>
                    {empty.message && <p className="max-w-sm text-[13px] text-ink-muted">{empty.message}</p>}
                    {empty.action}
                  </div>
                </td>
              </tr>
            ) : (
              paged.map((row, i) => (
                <tr
                  key={rowKey(row, i)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    "border-b border-line-soft transition-colors last:border-0",
                    onRowClick && "cursor-pointer hover:bg-surface-2"
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "px-4 py-3.5 text-sm text-ink",
                        col.align === "right" && "text-right tabular-nums"
                      )}
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pageSize > 0 && !loading && sorted.length > pageSize && (
        <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3 text-[13px] text-ink-muted">
          <span>
            {safePage * pageSize + 1}–{Math.min((safePage + 1) * pageSize, sorted.length)} sur {sorted.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
              className="grid h-8 w-8 place-items-center rounded-md border border-line bg-surface text-ink transition hover:border-primary-500 disabled:opacity-40 disabled:hover:border-line"
              aria-label="Page précédente"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-2 tabular-nums">{safePage + 1} / {totalPages}</span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={safePage >= totalPages - 1}
              className="grid h-8 w-8 place-items-center rounded-md border border-line bg-surface text-ink transition hover:border-primary-500 disabled:opacity-40 disabled:hover:border-line"
              aria-label="Page suivante"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;

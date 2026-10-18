import type { ReactNode } from "react";

export type Column<T> = {
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
  /** Hide this column in the stacked mobile cards (e.g. long text). */
  hideOnMobile?: boolean;
};

/**
 * Table on wide screens, stacked cards on phones, so nothing needs sideways
 * scrolling. A column with an empty header is treated as the row's actions.
 */
export default function DataTable<T extends { id: string }>({
  columns,
  rows,
  emptyMessage = "Nothing here yet.",
}: {
  columns: Column<T>[];
  rows: T[];
  emptyMessage?: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="border border-dashed border-ink/40 bg-white/60 px-6 py-16 text-center">
        <p className="mx-auto max-w-md text-ink-soft">{emptyMessage}</p>
      </div>
    );
  }

  const [first, ...rest] = columns.filter((c) => c.header !== "");
  const actions = columns.find((c) => c.header === "");

  return (
    <>
      {/* phones */}
      <ul className="space-y-3 md:hidden">
        {rows.map((row) => (
          <li key={row.id} className="border border-ink/30 bg-white p-4">
            <div className="text-[1rem] font-medium">{first.render(row)}</div>
            <dl className="mt-3 space-y-2">
              {rest
                .filter((c) => !c.hideOnMobile)
                .map((col) => (
                  <div key={col.header} className="flex items-baseline justify-between gap-4 text-sm">
                    <dt className="shrink-0 font-mono text-[0.64rem] uppercase tracking-[0.12em] text-ink-soft">{col.header}</dt>
                    <dd className="min-w-0 text-right">{col.render(row)}</dd>
                  </div>
                ))}
            </dl>
            {actions && <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-ink/10 pt-3">{actions.render(row)}</div>}
          </li>
        ))}
      </ul>

      {/* tablets and up */}
      <div className="hidden border border-ink/30 bg-white md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink/30 bg-paper-2">
                {columns.map((col, i) => (
                  <th key={col.header || `a${i}`} className="whitespace-nowrap px-4 py-3 font-mono text-[0.68rem] font-medium uppercase tracking-[0.12em] text-ink-soft">
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-ink/10 last:border-0 hover:bg-paper/70">
                  {columns.map((col, i) => (
                    <td key={col.header || `a${i}`} className={`px-4 py-3.5 align-middle text-ink ${col.className ?? ""}`}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

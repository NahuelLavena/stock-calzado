import type { ReactNode } from "react";

interface ResponsiveTableProps<T> {
  data: T[];
  renderCard: (item: T, index: number) => ReactNode;
  tableHead: ReactNode;
  tableBody: (item: T, index: number) => ReactNode;
  emptyMessage?: string;
  emptyColSpan?: number;
  caption?: string;
}

export function ResponsiveTable<T>({
  data,
  renderCard,
  tableHead,
  tableBody,
  emptyMessage = "No hay datos para mostrar",
  emptyColSpan = 5,
  caption,
}: ResponsiveTableProps<T>) {
  return (
    <>
      {/* Mobile: card list */}
      <div className="divide-y divide-slate-200 sm:hidden">
        {data.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-slate-500">
            {emptyMessage}
          </div>
        ) : (
          data.map((item, i) => renderCard(item, i))
        )}
      </div>

      {/* Desktop: table */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="min-w-full divide-y divide-slate-200">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead className="bg-slate-50">{tableHead}</thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={emptyColSpan}
                  className="px-6 py-12 text-center text-sm text-slate-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, i) => tableBody(item, i))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

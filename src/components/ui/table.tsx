import type { ReactNode } from "react";

interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className = "" }: TableProps) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-slate-200">
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children, className = "" }: TableProps) {
  return <thead className={`bg-slate-50 ${className}`}>{children}</thead>;
}

export function TableBody({ children, className = "" }: TableProps) {
  return (
    <tbody className={`divide-y divide-slate-200 bg-white ${className}`}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className = "" }: TableProps) {
  return (
    <tr className={`hover:bg-slate-50 ${className}`}>{children}</tr>
  );
}

export function TableHeadCell({
  children,
  className = "",
}: TableProps) {
  return (
    <th
      className={`px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 sm:px-6 ${className}`}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, className = "" }: TableProps) {
  return (
    <td className={`px-3 py-3 text-sm text-slate-900 sm:px-6 sm:py-4 ${className}`}>
      {children}
    </td>
  );
}

export function TableEmpty({
  colSpan,
  message = "No hay datos para mostrar",
}: {
  colSpan: number;
  message?: string;
}) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-3 py-8 text-center text-sm text-slate-500 sm:px-6 sm:py-12"
      >
        {message}
      </td>
    </tr>
  );
}

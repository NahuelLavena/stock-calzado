"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface VentasFiltersProps {
  fechaDesde: string;
  fechaHasta: string;
  metodoPago: string;
}

export function VentasFilters({
  fechaDesde,
  fechaHasta,
  metodoPago,
}: VentasFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const hasFilters = fechaDesde || fechaHasta || metodoPago;

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`/dashboard/ventas?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearFilters = useCallback(() => {
    router.push("/dashboard/ventas");
  }, [router]);

  const metodosPagoOptions = [
    { value: "", label: "Todos" },
    { value: "EFECTIVO", label: "Efectivo" },
    { value: "TRANSFERENCIA", label: "Transferencia" },
    { value: "TARJETA_DEBITO", label: "Tarjeta Débito" },
    { value: "TARJETA_CREDITO", label: "Tarjeta Crédito" },
    { value: "OTRO", label: "Otro" },
  ];

  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
      <select
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:w-44"
        value={metodoPago}
        onChange={(e) => updateParam("metodoPago", e.target.value)}
      >
        {metodosPagoOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <div className="flex items-center gap-2">
        <label className="whitespace-nowrap text-sm text-slate-600">
          Desde:
        </label>
        <input
          type="date"
          value={fechaDesde}
          onChange={(e) => updateParam("fechaDesde", e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="whitespace-nowrap text-sm text-slate-600">
          Hasta:
        </label>
        <input
          type="date"
          value={fechaHasta}
          onChange={(e) => updateParam("fechaHasta", e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>
      {hasFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="text-sm text-indigo-600 hover:underline"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}

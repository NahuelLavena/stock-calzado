"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface ValorSalidasFiltersProps {
  fechaDesde: string;
  fechaHasta: string;
}

export function ValorSalidasFilters({
  fechaDesde,
  fechaHasta,
}: ValorSalidasFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const hasFilters = fechaDesde || fechaHasta;

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/dashboard/reportes/valor-salidas?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearFilters = useCallback(() => {
    router.push("/dashboard/reportes/valor-salidas");
  }, [router]);

  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
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

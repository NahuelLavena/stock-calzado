"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Select } from "@/components/ui/select";

interface MovementFiltersProps {
  tipo: string;
  productoId: string;
  productos: { id: string; nombre: string; sku: string }[];
  fechaDesde: string;
  fechaHasta: string;
  usuarioId: string;
  usuarios: { id: string; nombre: string }[];
  esAdmin: boolean;
}

const tipos = [
  { value: "", label: "Todos" },
  { value: "ENTRADA", label: "Entradas" },
  { value: "SALIDA", label: "Salidas" },
  { value: "AJUSTE_POS", label: "Ajustes +" },
  { value: "AJUSTE_NEG", label: "Ajustes -" },
  { value: "DEVOLUCION", label: "Devoluciones" },
];

export function MovementFilters({
  tipo,
  productoId,
  productos,
  fechaDesde,
  fechaHasta,
  usuarioId,
  usuarios,
  esAdmin,
}: MovementFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeFilterCount =
    (tipo ? 1 : 0) +
    (productoId ? 1 : 0) +
    (fechaDesde ? 1 : 0) +
    (fechaHasta ? 1 : 0) +
    (usuarioId ? 1 : 0);

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`/dashboard/movimientos?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearFilters = useCallback(() => {
    router.push("/dashboard/movimientos");
  }, [router]);

  const productoOptions = [
    { value: "", label: "Todos" },
    ...productos.map((p) => ({ value: p.id, label: `${p.nombre} (${p.sku})` })),
  ];

  const usuarioOptions = [
    { value: "", label: "Todos" },
    ...usuarios.map((u) => ({ value: u.id, label: u.nombre })),
  ];

  return (
    <div className="mb-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
        <Select
          name="tipo"
          options={tipos}
          value={tipo}
          onChange={(e) => updateParam("tipo", e.target.value)}
          className="w-full sm:w-44"
        />

        <button
          type="button"
          onClick={() => setFiltersOpen((prev) => !prev)}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:hidden"
        >
          Filtros
          {activeFilterCount > 0 && (
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-semibold text-white">
              {activeFilterCount}
            </span>
          )}
          <svg
            className={`h-4 w-4 text-slate-400 transition-transform ${filtersOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm text-indigo-600 hover:underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Expanded filters (mobile) / inline filters (desktop) */}
      <div className={`${filtersOpen ? "mt-3 flex flex-col gap-3" : "hidden"} sm:flex sm:flex-row sm:items-center sm:flex-wrap`}>
        <div className={filtersOpen ? "" : "hidden sm:block"}>
          <Select
            name="productoId"
            options={productoOptions}
            value={productoId}
            onChange={(e) => updateParam("productoId", e.target.value)}
            className="w-full sm:w-56"
          />
        </div>
        <div className={`flex items-center gap-2 ${filtersOpen ? "" : "hidden sm:flex"} sm:flex-1 sm:justify-center`}>
          <label className="whitespace-nowrap text-sm text-slate-600">Desde:</label>
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => updateParam("fechaDesde", e.target.value)}
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:w-auto"
          />
        </div>
        <div className={`flex items-center gap-2 ${filtersOpen ? "" : "hidden sm:flex"} sm:flex-1 sm:justify-center`}>
          <label className="whitespace-nowrap text-sm text-slate-600">Hasta:</label>
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => updateParam("fechaHasta", e.target.value)}
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:w-auto"
          />
        </div>
        {esAdmin && usuarios.length > 0 && (
          <div className={filtersOpen ? "" : "hidden sm:block"}>
            <Select
              name="usuarioId"
              options={usuarioOptions}
              value={usuarioId}
              onChange={(e) => updateParam("usuarioId", e.target.value)}
              className="w-full sm:w-44"
            />
          </div>
        )}
      </div>
    </div>
  );
}

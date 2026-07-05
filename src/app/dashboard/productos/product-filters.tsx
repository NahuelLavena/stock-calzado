"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";

interface ProductFiltersProps {
  search: string;
  categoria: string;
  estado: string;
  marca: string;
  marcas: string[];
}

const categorias = [
  { value: "", label: "Todas" },
  { value: "ZAPATILLAS", label: "Zapatillas" },
  { value: "BOTAS", label: "Botas" },
  { value: "SANDALIAS", label: "Sandalias" },
  { value: "ZAPATOS", label: "Zapatos" },
  { value: "DEPORTIVOS", label: "Deportivos" },
  { value: "OTROS", label: "Otros" },
];

const estados = [
  { value: "", label: "Todos" },
  { value: "activo", label: "Activos" },
  { value: "inactivo", label: "Inactivos" },
];

export function ProductFilters({
  search,
  categoria,
  estado,
  marca,
  marcas,
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`/dashboard/productos?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("categoria");
    params.delete("estado");
    params.delete("marca");
    params.delete("page");
    router.push(`/dashboard/productos?${params.toString()}`);
  }, [router, searchParams]);

  const marcaOptions = [
    { value: "", label: "Todas" },
    ...marcas.map((m) => ({ value: m, label: m })),
  ];

  const activeFilterCount =
    (categoria ? 1 : 0) + (estado ? 1 : 0) + (marca ? 1 : 0);
  const hasActiveFilters = activeFilterCount > 0;

  const filterSelects = (
    <>
      <Select
        name="marca"
        options={marcaOptions}
        value={marca}
        onChange={(e) => updateParam("marca", e.target.value)}
        className="w-full sm:w-40"
      />
      <Select
        name="categoria"
        options={categorias}
        value={categoria}
        onChange={(e) => updateParam("categoria", e.target.value)}
        className="w-full sm:w-40"
      />
      <Select
        name="estado"
        options={estados}
        value={estado}
        onChange={(e) => updateParam("estado", e.target.value)}
        className="w-full sm:w-36"
      />
    </>
  );

  return (
    <div className="mb-4 flex flex-col gap-3">
      {/* Mobile: search + toggle */}
      <div className="flex items-center gap-2 sm:hidden">
        <div className="flex-1">
          <SearchInput
            placeholder="Buscar por nombre, SKU o marca..."
            value={search}
            onChange={(e) => {
              const value = e.target.value;
              if (debounceRef.current) clearTimeout(debounceRef.current);
              debounceRef.current = setTimeout(() => {
                updateParam("search", value);
              }, 300);
            }}
          />
        </div>
        <button
          type="button"
          onClick={() => setFiltersOpen((o) => !o)}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="4" y1="21" x2="4" y2="14" />
            <line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" />
            <line x1="20" y1="12" x2="20" y2="3" />
            <circle cx="4" cy="12" r="2" />
            <circle cx="12" cy="10" r="2" />
            <circle cx="20" cy="14" r="2" />
          </svg>
          Filtros
          {hasActiveFilters && <span>({activeFilterCount})</span>}
        </button>
      </div>

      {/* Mobile: collapsible filter selects */}
      {filtersOpen && (
        <div className="flex flex-col gap-3 sm:hidden">
          {filterSelects}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-left text-sm text-indigo-600 hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* Desktop: all filters inline */}
      <div className="hidden flex-col items-center gap-3 sm:flex sm:flex-row">
        <div className="flex-1">
          <SearchInput
            placeholder="Buscar por nombre, SKU o marca..."
            value={search}
            onChange={(e) => {
              const value = e.target.value;
              if (debounceRef.current) clearTimeout(debounceRef.current);
              debounceRef.current = setTimeout(() => {
                updateParam("search", value);
              }, 300);
            }}
          />
        </div>
        {filterSelects}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="whitespace-nowrap text-sm text-indigo-600 hover:underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}

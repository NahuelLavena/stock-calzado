"use client";

import { useState } from "react";
import { useProductosOffline } from "@/hooks/useProductosOffline";
import { useMovimientosOffline } from "@/hooks/useMovimientosOffline";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { Search, ArrowUpRight, ArrowDownLeft, AlertTriangle } from "lucide-react";

const TIPOS = [
  { value: "ENTRADA", label: "Entrada", color: "text-green-600", bg: "bg-green-50" },
  { value: "SALIDA", label: "Salida", color: "text-red-600", bg: "bg-red-50" },
  { value: "DEVOLUCION", label: "Devolución", color: "text-blue-600", bg: "bg-blue-50" },
  { value: "AJUSTE_POS", label: "Ajuste +", color: "text-emerald-600", bg: "bg-emerald-50" },
  { value: "AJUSTE_NEG", label: "Ajuste -", color: "text-orange-600", bg: "bg-orange-50" },
];

export function OfflineMovimientosList() {
  const isOnline = useOnlineStatus();
  const { movimientos, loading } = useMovimientosOffline();
  const { productos } = useProductosOffline();
  const [tipoFilter, setTipoFilter] = useState("");
  const [search, setSearch] = useState("");

  if (isOnline) return null;
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-600" />
      </div>
    );
  }

  const getProductoInfo = (tallajeId: string) => {
    for (const p of productos) {
      const t = p.tallas.find((t) => t.id === tallajeId);
      if (t) return { nombre: p.nombre, sku: p.sku, talla: t.talla, color: t.color };
    }
    return null;
  };

  const filtered = movimientos.filter((m) => {
    const matchTipo = !tipoFilter || m.tipo === tipoFilter;
    if (!matchTipo) return false;
    if (!search) return true;
    const info = getProductoInfo(m.tallajeId);
    if (!info) return false;
    const q = search.toLowerCase();
    return (
      info.nombre.toLowerCase().includes(q) ||
      info.sku.toLowerCase().includes(q)
    );
  });

  const totalEntradas = filtered
    .filter((m) => ["ENTRADA", "DEVOLUCION"].includes(m.tipo))
    .reduce((acc, m) => acc + m.cantidad, 0);

  const totalSalidas = filtered
    .filter((m) => ["SALIDA", "AJUSTE_NEG"].includes(m.tipo))
    .reduce((acc, m) => acc + m.cantidad, 0);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <AlertTriangle className="mr-2 inline h-4 w-4" />
        Modo offline — datos de IndexedDB
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2">
            <ArrowDownLeft className="h-4 w-4 text-green-600" />
            <span className="text-sm text-slate-500">Entradas</span>
          </div>
          <p className="mt-1 text-2xl font-semibold text-green-600">{totalEntradas}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2">
            <ArrowUpRight className="h-4 w-4 text-red-600" />
            <span className="text-sm text-slate-500">Salidas</span>
          </div>
          <p className="mt-1 text-2xl font-semibold text-red-600">{totalSalidas}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Total</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{filtered.length}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por producto o SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <select
          value={tipoFilter}
          onChange={(e) => setTipoFilter(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">Todos los tipos</option>
          {TIPOS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Tipo
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Producto
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Cantidad
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Fecha
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">
                  No se encontraron movimientos
                </td>
              </tr>
            ) : (
              filtered.slice(0, 50).map((m) => {
                const tipoInfo = TIPOS.find((t) => t.value === m.tipo) || TIPOS[0];
                const info = getProductoInfo(m.tallajeId);
                return (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${tipoInfo.bg} ${tipoInfo.color}`}
                      >
                        {tipoInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-slate-900">
                        {info?.nombre || "—"}
                      </div>
                      <div className="text-xs text-slate-500">
                        {info?.sku} — {info?.talla}/{info?.color}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                      {m.cantidad}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {new Date(m.createdAt).toLocaleDateString("es-AR")}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

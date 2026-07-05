"use client";

import { useState } from "react";
import { useProductosOffline } from "@/hooks/useProductosOffline";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { Search, Package, AlertTriangle } from "lucide-react";

const CATEGORIAS = [
  "ZAPATILLAS",
  "BOTAS",
  "SANDALIAS",
  "ZAPATOS",
  "DEPORTIVOS",
  "OTROS",
];

export function OfflineProductosList() {
  const isOnline = useOnlineStatus();
  const { productos, loading } = useProductosOffline();
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("");
  const [estado, setEstado] = useState("");

  if (isOnline) return null;
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-600" />
      </div>
    );
  }

  const filtered = productos.filter((p) => {
    const matchSearch =
      !search ||
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.marca.toLowerCase().includes(search.toLowerCase());
    const matchCategoria = !categoria || p.categoria === categoria;
    const matchEstado =
      estado === "" ||
      (estado === "activo" && p.activo) ||
      (estado === "inactivo" && !p.activo);
    return matchSearch && matchCategoria && matchEstado;
  });

  const totalStock = (tallas: typeof productos[0]["tallas"]) =>
    tallas.reduce((acc, t) => acc + t.stock, 0);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <AlertTriangle className="mr-2 inline h-4 w-4" />
        Modo offline — datos de IndexedDB
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, SKU o marca..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">Todas las categorías</option>
          {CATEGORIAS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">Todos</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Producto
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                SKU
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Categoría
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Stock
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                  <Package className="mx-auto mb-2 h-8 w-8 text-slate-400" />
                  No se encontraron productos
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-slate-900">{p.nombre}</div>
                    <div className="text-xs text-slate-500">{p.marca}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{p.sku}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{p.categoria}</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                    {totalStock(p.tallas)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        p.activo
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {p.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-500">
        {filtered.length} de {productos.length} productos
      </p>
    </div>
  );
}

"use client";

import { useProductosOffline } from "@/hooks/useProductosOffline";
import { useMovimientosOffline } from "@/hooks/useMovimientosOffline";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { Package, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

export function OfflineDashboardStats() {
  const isOnline = useOnlineStatus();
  const { productos } = useProductosOffline();
  const { movimientos } = useMovimientosOffline();

  if (isOnline) return null;

  const now = new Date();
  const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);

  const totalProductos = productos.length;
  let stockTotal = 0;
  for (const p of productos) {
    for (const t of p.tallas) {
      stockTotal += t.stock;
    }
  }

  const movimientosMes = movimientos.filter(
    (m) => new Date(m.createdAt) >= inicioMes
  );

  const entradas = movimientosMes
    .filter((m) => ["ENTRADA", "DEVOLUCION"].includes(m.tipo))
    .reduce((acc, m) => acc + m.cantidad, 0);

  const salidas = movimientosMes
    .filter((m) => ["SALIDA", "AJUSTE_NEG"].includes(m.tipo))
    .reduce((acc, m) => acc + m.cantidad, 0);

  const stockBajo = productos.flatMap((p) =>
    p.tallas
      .filter((t) => t.stock <= t.stockMinimo)
      .map((t) => ({
        productoNombre: p.nombre,
        productoSku: p.sku,
        talla: t.talla,
        color: t.color,
        stock: t.stock,
      }))
  );

  const stats = [
    {
      label: "Total Productos",
      value: totalProductos,
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Stock Total",
      value: stockTotal,
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Entradas del Mes",
      value: entradas,
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Salidas del Mes",
      value: salidas,
      icon: TrendingDown,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <AlertTriangle className="mr-2 inline h-4 w-4" />
        Modo offline — mostrando datos locales
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-slate-200 bg-white p-4"
          >
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="text-2xl font-semibold text-slate-900">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {stockBajo.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-medium text-slate-900">
            Stock Bajo ({stockBajo.length})
          </h3>
          <div className="space-y-2">
            {stockBajo.slice(0, 5).map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-slate-600">
                  {item.productoNombre} — {item.talla} / {item.color}
                </span>
                <span className="font-medium text-red-600">
                  {item.stock} uds
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

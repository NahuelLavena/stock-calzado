"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DashboardData {
  resumen: {
    hoy: { cantidad: number; valor: number };
    mes: { cantidad: number; valor: number; unidades: number };
    ticketPromedio: number;
  };
  tendencia: Array<{ fecha: string; cantidad: number; valor: number }>;
  metodoPago: Array<{ metodo: string; cantidad: number; valor: number; count: number }>;
  topProductos: Array<{
    nombre: string;
    sku: string;
    marca: string;
    talla: string;
    color: string;
    cantidad: number;
    valor: number;
  }>;
  categorias: Array<{ nombre: string; cantidad: number; valor: number }>;
}

const metodoPagoLabels: Record<string, string> = {
  EFECTIVO: "Efectivo",
  TRANSFERENCIA: "Transferencia",
  TARJETA_DEBITO: "Tarjeta Débito",
  TARJETA_CREDITO: "Tarjeta Crédito",
  OTRO: "Otro",
};

const metodoPagoColors: Record<string, string> = {
  EFECTIVO: "bg-emerald-500",
  TRANSFERENCIA: "bg-blue-500",
  TARJETA_DEBITO: "bg-amber-500",
  TARJETA_CREDITO: "bg-purple-500",
  OTRO: "bg-slate-400",
};

const categoriaLabels: Record<string, string> = {
  HOMBRES: "Hombres",
  MUJER: "Mujer",
  NINO: "Niño",
  NINA: "Niña",
  URBANAS: "Urbanas",
  BOTINES: "Botines",
  BEBE: "Bebé",
  JUVENIL: "Juvenil",
  PANTUFLAS: "Pantuflas",
  OJOTAS: "Ojotas",
};

export default function VentasDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics/ventas-dashboard")
      .then((r) => {
        if (!r.ok) throw new Error("API error");
        return r.json();
      })
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n: number) =>
    n.toLocaleString("es-AR", { style: "currency", currency: "ARS" });

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-slate-500">Cargando dashboard...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-slate-500">Error al cargar datos</p>
      </div>
    );
  }

  // Find max values for chart scaling
  const maxDiaValor = Math.max(...data.tendencia.map((d) => d.valor), 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/dashboard/ventas"
            className="text-sm text-indigo-600 hover:underline"
          >
            ← Volver a ventas
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            Dashboard de Ventas
          </h1>
          <p className="text-sm text-slate-500">
            Resumen del mes actual
          </p>
        </div>
        <Link href="/dashboard/ventas/nuevo">
          <Button size="sm">Nueva Venta</Button>
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-slate-500">Ventas hoy</p>
            <p className="text-2xl font-bold text-slate-900">
              {data.resumen.hoy.cantidad}
            </p>
            <p className="text-sm text-emerald-600">
              {fmt(data.resumen.hoy.valor)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-slate-500">Ventas este mes</p>
            <p className="text-2xl font-bold text-slate-900">
              {data.resumen.mes.cantidad}
            </p>
            <p className="text-sm text-emerald-600">
              {fmt(data.resumen.mes.valor)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-slate-500">Unidades vendidas</p>
            <p className="text-2xl font-bold text-slate-900">
              {data.resumen.mes.unidades}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-slate-500">Ticket promedio</p>
            <p className="text-2xl font-bold text-slate-900">
              {fmt(data.resumen.ticketPromedio)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tendencia diaria (30 días)</CardTitle>
          </CardHeader>
          <CardContent>
            {data.tendencia.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                No hay ventas en los últimos 30 días
              </p>
            ) : (
              <div className="flex items-end gap-1" style={{ height: 120 }}>
                {data.tendencia.map((d) => (
                  <div
                    key={d.fecha}
                    className="flex flex-1 flex-col items-center gap-1"
                    title={`${d.fecha}: ${fmt(d.valor)} (${d.cantidad} u.)`}
                  >
                    <div
                      className="w-full rounded-t bg-indigo-500 transition-all hover:bg-indigo-600"
                      style={{
                        height: `${(d.valor / maxDiaValor) * 100}%`,
                        minHeight: d.valor > 0 ? 4 : 0,
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* By payment method */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ventas por método de pago</CardTitle>
          </CardHeader>
          <CardContent>
            {data.metodoPago.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                No hay ventas este mes
              </p>
            ) : (
              <div className="space-y-3">
                {data.metodoPago.map((m) => (
                  <div key={m.metodo}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-slate-700">
                        {metodoPagoLabels[m.metodo] || m.metodo}
                      </span>
                      <span className="font-medium text-slate-900">
                        {fmt(m.valor)} ({m.cantidad} u.)
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${metodoPagoColors[m.metodo] || "bg-slate-400"}`}
                        style={{
                          width: `${(m.valor / data.resumen.mes.valor) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top productos vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            {data.topProductos.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                No hay ventas este mes
              </p>
            ) : (
              <div className="space-y-3">
                {data.topProductos.slice(0, 8).map((p, i) => (
                  <div key={`${p.sku}-${i}`} className="flex items-center gap-3">
                    <span className="w-6 text-center text-sm font-bold text-slate-400">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {p.nombre}
                      </p>
                      <p className="text-xs text-slate-500">
                        {p.talla}/{p.color} · {p.marca}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">
                        {fmt(p.valor)}
                      </p>
                      <p className="text-xs text-slate-500">{p.cantidad} u.</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* By category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ventas por categoría</CardTitle>
          </CardHeader>
          <CardContent>
            {data.categorias.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                No hay ventas este mes
              </p>
            ) : (
              <div className="space-y-3">
                {data.categorias.map((c) => (
                  <div key={c.nombre}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-slate-700">
                        {categoriaLabels[c.nombre] || c.nombre}
                      </span>
                      <span className="font-medium text-slate-900">
                        {fmt(c.valor)} ({c.cantidad} u.)
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{
                          width: `${(c.valor / data.resumen.mes.valor) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

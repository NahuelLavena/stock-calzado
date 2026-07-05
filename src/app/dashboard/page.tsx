import Link from "next/link";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { requireUsuarioAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TableRow,
  TableHeadCell,
  TableCell,
} from "@/components/ui/table";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { ReportButton } from "./components/report-button";
import { OfflineDashboardStats } from "./components/offline-dashboard-stats";
import { OfflineAware } from "./components/offline-aware";
import { tipoLabels, tipoVariants } from "@/lib/constants";

const MovementChart = dynamic(
  () => import("./components/movement-chart").then((mod) => mod.MovementChart),
);

export default async function DashboardPage() {
  const usuario = await requireUsuarioAuth();
  const empresaId = usuario.empresaId;
  const now = new Date();

  let totalProductos = 0;
  let totalStock = { _sum: { stock: 0 } };
  let movimientosMes = 0;
  let stockBajo: Array<{ id: string; productoId: string; talla: string; color: string; stock: number; producto: { nombre: string; sku: string } }> = [];
  let ultimosMovimientos: Array<{ id: string; tipo: string; cantidad: number; createdAt: Date; usuario: { nombre: string }; tallaje: { talla: string; color: string; producto: { nombre: string } } }> = [];
  let entradasMes = { _sum: { cantidad: 0 } };
  let salidasMes = { _sum: { cantidad: 0 } };
  let movimientosChart: Array<{ tipo: string; cantidad: number; createdAt: Date }> = [];

  try {
    const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
    const hace30Dias = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalProductosResult,
      totalStockResult,
      movimientosMesResult,
      stockBajoResult,
      ultimosMovimientosResult,
      entradasMesResult,
      salidasMesResult,
      movimientosChartResult,
    ] = await Promise.all([
      prisma.producto.count({
        where: { empresaId, activo: true },
      }),
      prisma.tallaje.aggregate({
        where: { producto: { empresaId, activo: true } },
        _sum: { stock: true },
      }),
      prisma.movimiento.count({
        where: {
          usuario: { empresaId },
          createdAt: { gte: inicioMes },
        },
      }),
      prisma.tallaje.findMany({
        where: {
          stock: { lte: 5 },
          producto: { empresaId, activo: true },
        },
        include: { producto: { select: { nombre: true, sku: true } } },
        take: 5,
      }),
      prisma.movimiento.findMany({
        where: { usuario: { empresaId } },
        include: {
          usuario: { select: { nombre: true } },
          tallaje: {
            include: { producto: { select: { nombre: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.movimiento.aggregate({
        where: {
          usuario: { empresaId },
          tipo: { in: ["ENTRADA", "DEVOLUCION"] },
          createdAt: { gte: inicioMes },
        },
        _sum: { cantidad: true },
      }),
      prisma.movimiento.aggregate({
        where: {
          usuario: { empresaId },
          tipo: { in: ["SALIDA", "AJUSTE_NEG"] },
          createdAt: { gte: inicioMes },
        },
        _sum: { cantidad: true },
      }),
      prisma.movimiento.findMany({
        where: {
          usuario: { empresaId },
          createdAt: { gte: hace30Dias },
        },
        select: {
          tipo: true,
          cantidad: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    totalProductos = totalProductosResult;
    totalStock = { _sum: { stock: totalStockResult._sum.stock ?? 0 } };
    movimientosMes = movimientosMesResult;
    stockBajo = stockBajoResult;
    ultimosMovimientos = ultimosMovimientosResult;
    entradasMes = { _sum: { cantidad: entradasMesResult._sum.cantidad ?? 0 } };
    salidasMes = { _sum: { cantidad: salidasMesResult._sum.cantidad ?? 0 } };
    movimientosChart = movimientosChartResult;
  } catch {
    // Database unavailable (offline) — render with empty data, OfflineAware will show offline content
  }

  const puedeCrearMovimiento =
    usuario?.rol === "ADMIN" || usuario?.puedeEditarStock;

  const chartData = (() => {
    const mapa: Record<string, { entradas: number; salidas: number }> = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split("T")[0];
      mapa[key] = { entradas: 0, salidas: 0 };
    }
    for (const m of movimientosChart) {
      const key = m.createdAt.toISOString().split("T")[0];
      if (!mapa[key]) continue;
      if (m.tipo === "ENTRADA" || m.tipo === "DEVOLUCION" || m.tipo === "AJUSTE_POS") {
        mapa[key].entradas += m.cantidad;
      } else {
        mapa[key].salidas += m.cantidad;
      }
    }
    return Object.entries(mapa)
      .map(([fecha, v]) => ({ fecha, ...v }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha));
  })();

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-900">
          Bienvenido, {usuario?.nombre}
        </h1>
        {usuario?.rol === "ADMIN" && (
          <div className="flex gap-2">
            <ReportButton
              url="/api/reports/ejecutivo"
              filename={`reporte_ejecutivo_${new Date().toISOString().split("T")[0]}.pdf`}
              label="Reporte PDF"
            />
            <Link href="/dashboard/productos/nuevo">
              <Button variant="outline" size="sm">
                + Producto
              </Button>
            </Link>
            {puedeCrearMovimiento && (
              <Link href="/dashboard/movimientos/nuevo">
                <Button size="sm">+ Movimiento</Button>
              </Link>
            )}
          </div>
        )}
      </div>

      <OfflineAware
        onlineContent={
          <Suspense fallback={
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-lg bg-slate-100" />
              ))}
            </div>
          }>
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">Productos activos</p>
                    <span className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                      👟
                    </span>
                  </div>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {totalProductos}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">Stock total</p>
                    <span className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                      📦
                    </span>
                  </div>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {totalStock._sum.stock ?? 0}
                  </p>
                  <div className="mt-1 flex gap-3 text-xs">
                    <span className="text-emerald-600">
                      +{entradasMes._sum.cantidad ?? 0} entradas
                    </span>
                    <span className="text-rose-600">
                      -{salidasMes._sum.cantidad ?? 0} salidas
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">Movimientos este mes</p>
                    <span className="rounded-lg bg-violet-50 p-2 text-violet-600">
                      🔄
                    </span>
                  </div>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {movimientosMes}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">Stock bajo</p>
                    <span className="rounded-lg bg-rose-50 p-2 text-rose-600">
                      ⚠️
                    </span>
                  </div>
                  <p className="mt-2 text-3xl font-bold text-rose-600">
                    {stockBajo.length}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {stockBajo.length === 0 ? "Todo en orden" : "Requiere atención"}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-6">
              <CardContent>
                <h2 className="mb-4 text-lg font-semibold text-slate-900">
                  Movimientos últimos 30 días
                </h2>
                <MovementChart data={chartData} />
              </CardContent>
            </Card>

            {stockBajo.length > 0 && (
              <Card className="mb-6">
                <CardContent>
                  <h2 className="mb-4 text-lg font-semibold text-slate-900">
                    ⚠️ Stock bajo
                  </h2>
                  <div className="space-y-2">
                    {stockBajo.map((t) => (
                      <Link
                        key={t.id}
                        href={`/dashboard/productos/${t.productoId}`}
                        className="flex items-center justify-between rounded-md border border-slate-100 px-4 py-3 transition-colors hover:bg-slate-50"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-900">
                            {t.producto.nombre}
                          </p>
                          <p className="text-xs text-slate-500">
                            {t.producto.sku} · Talla {t.talla} · {t.color}
                          </p>
                        </div>
                        <Badge
                          variant={
                            t.stock === 0
                              ? "danger"
                              : t.stock <= 3
                                ? "warning"
                                : "info"
                          }
                        >
                          {t.stock} u.
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Actividad reciente
                  </h2>
                  <Link
                    href="/dashboard/movimientos"
                    className="text-sm text-indigo-600 hover:underline"
                  >
                    Ver todos →
                  </Link>
                </div>

                <ResponsiveTable
                  data={ultimosMovimientos}
                  emptyMessage="No hay movimientos registrados."
                  emptyColSpan={6}
                  renderCard={(m) => (
                    <Link
                      key={m.id}
                      href={`/dashboard/movimientos/${m.id}`}
                      className="block px-4 py-3 transition-colors hover:bg-slate-50"
                    >
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className="text-sm text-slate-500">
                          {new Date(m.createdAt).toLocaleDateString("es-AR")}
                        </span>
                        <Badge variant={tipoVariants[m.tipo]}>
                          {tipoLabels[m.tipo]}
                        </Badge>
                      </div>
                      <p className="truncate text-sm font-medium text-slate-900">
                        {m.tallaje.producto.nombre}
                      </p>
                      <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                        <span>
                          Talla {m.tallaje.talla} · {m.tallaje.color}
                        </span>
                        <span
                          className={
                            m.tipo === "ENTRADA" || m.tipo === "DEVOLUCION"
                              ? "font-medium text-emerald-600"
                              : m.tipo === "SALIDA"
                                ? "font-medium text-rose-600"
                                : ""
                          }
                        >
                          {m.tipo === "SALIDA" || m.tipo === "AJUSTE_NEG" ? "-" : "+"}
                          {m.cantidad}
                        </span>
                      </div>
                    </Link>
                  )}
                  tableHead={
                    <TableRow>
                      <TableHeadCell>Fecha</TableHeadCell>
                      <TableHeadCell>Tipo</TableHeadCell>
                      <TableHeadCell>Producto</TableHeadCell>
                      <TableHeadCell className="hidden sm:table-cell">Talla/Color</TableHeadCell>
                      <TableHeadCell>Cantidad</TableHeadCell>
                      <TableHeadCell className="hidden md:table-cell">Usuario</TableHeadCell>
                    </TableRow>
                  }
                  tableBody={(m) => (
                    <TableRow key={m.id}>
                      <TableCell>
                        <Link
                          href={`/dashboard/movimientos/${m.id}`}
                          className="text-indigo-600 hover:underline"
                        >
                          {new Date(m.createdAt).toLocaleDateString("es-AR")}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant={tipoVariants[m.tipo]}>
                          {tipoLabels[m.tipo]}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {m.tallaje.producto.nombre}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {m.tallaje.talla} · {m.tallaje.color}
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            m.tipo === "ENTRADA" || m.tipo === "DEVOLUCION"
                              ? "font-medium text-emerald-600"
                              : m.tipo === "SALIDA"
                                ? "font-medium text-rose-600"
                                : ""
                          }
                        >
                          {m.tipo === "SALIDA" || m.tipo === "AJUSTE_NEG"
                            ? "-"
                            : "+"}
                          {m.cantidad}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{m.usuario.nombre}</TableCell>
                    </TableRow>
                  )}
                />
              </CardContent>
            </Card>
          </Suspense>
        }
        offlineContent={<OfflineDashboardStats />}
      />
    </div>
  );
}

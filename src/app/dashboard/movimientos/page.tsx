import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUsuarioAuth } from "@/lib/auth-helpers";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import {
  TableRow,
  TableHeadCell,
  TableCell,
} from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { MovementFilters } from "./movement-filters";
import { MovimientoRowActions } from "./movimiento-row-actions";
import { ReportMovimientosButton } from "./report-movimientos-button";
import { OfflineMovimientosList } from "../components/offline-movimientos-list";
import { OfflineAware } from "../components/offline-aware";
import { tipoLabels, tipoVariants } from "@/lib/constants";

const ITEMS_PER_PAGE = 20;

export const metadata: Metadata = {
  title: "Movimientos",
};

export default async function MovimientosPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const usuario = await requireUsuarioAuth();

  const tipo = typeof params.tipo === "string" ? params.tipo : "";
  const productoId = typeof params.productoId === "string" ? params.productoId : "";
  const fechaDesde = typeof params.fechaDesde === "string" ? params.fechaDesde : "";
  const fechaHasta = typeof params.fechaHasta === "string" ? params.fechaHasta : "";
  const usuarioId = typeof params.usuarioId === "string" ? params.usuarioId : "";
  const page = Math.max(1, parseInt(typeof params.page === "string" ? params.page : "1"));

  let movimientos: Array<{ id: string; tipo: string; cantidad: number; createdAt: Date; usuario: { nombre: string }; tallaje: { talla: string; color: string; producto: { nombre: string; sku: string } } }> = [];
  let total = 0;
  let resumen = { _count: 0, _sum: { cantidad: 0 } };
  let productos: Array<{ id: string; nombre: string; sku: string }> = [];
  let usuarios: Array<{ id: string; nombre: string }> = [];
  let entradas = { _sum: { cantidad: 0 } };
  let salidas = { _sum: { cantidad: 0 } };

  try {
    const where: Record<string, unknown> = {
      usuario: { empresaId: usuario.empresaId },
    };

    if (tipo) {
      where.tipo = tipo;
    }

    if (productoId) {
      where.tallaje = { ...where.tallaje as Record<string, unknown>, productoId };
    }

    if (fechaDesde || fechaHasta) {
      where.createdAt = {};
      if (fechaDesde) {
        (where.createdAt as Record<string, unknown>).gte = new Date(fechaDesde);
      }
      if (fechaHasta) {
        const hasta = new Date(fechaHasta);
        hasta.setHours(23, 59, 59, 999);
        (where.createdAt as Record<string, unknown>).lte = hasta;
      }
    }

    if (usuarioId) {
      where.usuario = { ...where.usuario as Record<string, unknown>, id: usuarioId };
    }

    const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const [movimientosRaw, totalRaw, resumenRaw, productosRaw, usuariosRaw, entradasRaw, salidasRaw] = await Promise.all([
      prisma.movimiento.findMany({
        where,
        include: {
          usuario: { select: { nombre: true } },
          tallaje: {
            include: {
              producto: { select: { nombre: true, sku: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: ITEMS_PER_PAGE,
        skip: (page - 1) * ITEMS_PER_PAGE,
      }),
      prisma.movimiento.count({ where }),
      prisma.movimiento.aggregate({
        where: {
          usuario: { empresaId: usuario.empresaId },
          createdAt: { gte: inicioMes },
        },
        _sum: { cantidad: true },
        _count: true,
      }),
      prisma.producto.findMany({
        where: { empresaId: usuario.empresaId, activo: true },
        select: { id: true, nombre: true, sku: true },
        orderBy: { nombre: "asc" },
      }),
      usuario.rol === "ADMIN"
        ? prisma.usuario.findMany({
            where: { empresaId: usuario.empresaId },
            select: { id: true, nombre: true },
            orderBy: { nombre: "asc" },
          })
        : Promise.resolve([]),
      prisma.movimiento.aggregate({
        where: {
          usuario: { empresaId: usuario.empresaId },
          tipo: { in: ["ENTRADA", "DEVOLUCION"] },
          createdAt: { gte: inicioMes },
        },
        _sum: { cantidad: true },
      }),
      prisma.movimiento.aggregate({
        where: {
          usuario: { empresaId: usuario.empresaId },
          tipo: { in: ["SALIDA", "AJUSTE_NEG"] },
          createdAt: { gte: inicioMes },
        },
        _sum: { cantidad: true },
      }),
    ]);

    movimientos = movimientosRaw;
    total = totalRaw;
    resumen = { _count: resumenRaw._count, _sum: { cantidad: resumenRaw._sum.cantidad ?? 0 } };
    productos = productosRaw;
    usuarios = usuariosRaw;
    entradas = { _sum: { cantidad: entradasRaw._sum.cantidad ?? 0 } };
    salidas = { _sum: { cantidad: salidasRaw._sum.cantidad ?? 0 } };
  } catch {
    // Database unavailable (offline) — render with empty data, OfflineAware will show offline content
  }

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Movimientos</h1>
        <div className="flex gap-2">
          <ReportMovimientosButton
            tipo={tipo}
            productoId={productoId}
            fechaDesde={fechaDesde}
            fechaHasta={fechaHasta}
          />
          {(usuario?.rol === "ADMIN" || usuario?.puedeEditarStock) && (
            <Link href="/dashboard/movimientos/nuevo">
              <Button>+ Nuevo Movimiento</Button>
            </Link>
          )}
        </div>
      </div>

      <OfflineAware
        onlineContent={
          <>
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Card>
                <CardContent>
                  <p className="text-sm text-slate-500">Entradas este mes</p>
                  <p className="mt-1 text-2xl font-bold text-emerald-600">
                    +{entradas._sum.cantidad ?? 0}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <p className="text-sm text-slate-500">Salidas este mes</p>
                  <p className="mt-1 text-2xl font-bold text-rose-600">
                    -{salidas._sum.cantidad ?? 0}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <p className="text-sm text-slate-500">Total movimientos</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {resumen._count}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Suspense fallback={<div className="mb-4 h-10 w-44 animate-pulse rounded-md bg-gray-100" />}>
              <MovementFilters
                tipo={tipo}
                productoId={productoId}
                productos={productos}
                fechaDesde={fechaDesde}
                fechaHasta={fechaHasta}
                usuarioId={usuarioId}
                usuarios={usuarios}
                esAdmin={usuario.rol === "ADMIN"}
              />
            </Suspense>

            <Card>
              <CardContent>
                <ResponsiveTable
                  data={movimientos}
                  emptyMessage={
                    tipo || productoId || fechaDesde || fechaHasta || usuarioId
                      ? "No hay movimientos con esos filtros."
                      : "No hay movimientos registrados."
                  }
                  emptyColSpan={7}
                  renderCard={(m) => (
                    <div key={m.id} className="px-4 py-3">
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/dashboard/movimientos/${m.id}`}
                          className="text-sm text-indigo-600 hover:underline"
                        >
                          {new Date(m.createdAt).toLocaleDateString("es-AR")}
                        </Link>
                        <Badge variant={tipoVariants[m.tipo]}>
                          {tipoLabels[m.tipo]}
                        </Badge>
                      </div>
                      <p className="mt-1 truncate text-sm font-medium text-slate-900">
                        {m.tallaje.producto.nombre}
                      </p>
                      <div className="mt-1 flex items-center justify-between text-sm text-slate-600">
                        <span>
                          Talla {m.tallaje.talla} · {m.tallaje.color}
                        </span>
                        <span
                          className={
                            m.tipo === "ENTRADA" || m.tipo === "DEVOLUCION"
                              ? "text-emerald-600 font-medium"
                              : m.tipo === "SALIDA"
                                ? "text-rose-600 font-medium"
                                : ""
                          }
                        >
                          {m.tipo === "SALIDA" || m.tipo === "AJUSTE_NEG" ? "-" : "+"}
                          {m.cantidad}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{m.usuario.nombre}</p>
                    </div>
                  )}
                  tableHead={
                    <TableRow>
                      <TableHeadCell>Fecha</TableHeadCell>
                      <TableHeadCell>Tipo</TableHeadCell>
                      <TableHeadCell>Producto</TableHeadCell>
                      <TableHeadCell className="hidden sm:table-cell">Talla/Color</TableHeadCell>
                      <TableHeadCell>Cantidad</TableHeadCell>
                      <TableHeadCell className="hidden md:table-cell">Usuario</TableHeadCell>
                      <TableHeadCell className="hidden sm:table-cell">Acciones</TableHeadCell>
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
                              ? "text-emerald-600 font-medium"
                              : m.tipo === "SALIDA"
                                ? "text-rose-600 font-medium"
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
                      <TableCell className="hidden sm:table-cell">
                        <MovimientoRowActions id={m.id} />
                      </TableCell>
                    </TableRow>
                  )}
                />

                {totalPages > 1 && (
                  <div className="mt-4">
                    <Suspense fallback={<div className="flex items-center justify-between"><div className="h-8 w-20 animate-pulse rounded-md bg-gray-100" /><div className="flex gap-1"><div className="h-8 w-8 animate-pulse rounded-md bg-gray-100" /><div className="h-8 w-8 animate-pulse rounded-md bg-gray-100" /><div className="h-8 w-8 animate-pulse rounded-md bg-gray-100" /></div><div className="h-8 w-20 animate-pulse rounded-md bg-gray-100" /></div>}>
                      <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                      />
                    </Suspense>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        }
        offlineContent={<OfflineMovimientosList />}
      />
    </div>
  );
}

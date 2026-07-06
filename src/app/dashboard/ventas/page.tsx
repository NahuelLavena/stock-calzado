import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUsuarioAuth } from "@/lib/auth-helpers";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeadCell,
  TableCell,
  TableEmpty,
} from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { metodoPagoLabels } from "@/lib/validations/venta";
import { VentasFilters } from "./ventas-filters";

export const metadata: Metadata = {
  title: "Ventas",
};

const ITEMS_PER_PAGE = 20;

export default async function VentasPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const usuario = await requireUsuarioAuth();

  const fechaDesde = typeof params.fechaDesde === "string" ? params.fechaDesde : "";
  const fechaHasta = typeof params.fechaHasta === "string" ? params.fechaHasta : "";
  const metodoPago = typeof params.metodoPago === "string" ? params.metodoPago : "";
  const page = Math.max(1, parseInt(typeof params.page === "string" ? params.page : "1"));

  const where: Record<string, unknown> = { empresaId: usuario.empresaId };

  if (fechaDesde || fechaHasta) {
    const createdAt: Record<string, Date> = {};
    if (fechaDesde) createdAt.gte = new Date(fechaDesde);
    if (fechaHasta) {
      const hasta = new Date(fechaHasta);
      hasta.setHours(23, 59, 59, 999);
      createdAt.lte = hasta;
    }
    where.createdAt = createdAt;
  }

  if (metodoPago) where.metodoPago = metodoPago;

  let ventas: Array<{
    id: string;
    metodoPago: string;
    cantidad: number;
    precioUnitario: { toNumber: () => number };
    total: { toNumber: () => number };
    createdAt: Date;
    cliente: { nombre: string } | null;
    usuario: { nombre: string };
    tallaje: {
      talla: string;
      color: string;
      producto: { nombre: string; sku: string };
    };
  }> = [];
  let total = 0;

  try {
    [ventas, total] = await Promise.all([
      prisma.venta.findMany({
        where,
        include: {
          cliente: { select: { nombre: true } },
          usuario: { select: { nombre: true } },
          tallaje: {
            include: {
              producto: { select: { nombre: true, sku: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * ITEMS_PER_PAGE,
        take: ITEMS_PER_PAGE,
      }),
      prisma.venta.count({ where }),
    ]);
  } catch {
    // Offline or DB error
  }

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  // Summary for current period
  let resumen = { _sum: { total: 0, cantidad: 0 }, _count: 0 };
  try {
    const raw = await prisma.venta.aggregate({
      where,
      _sum: { total: true, cantidad: true },
      _count: true,
    });
    resumen = {
      _sum: {
        total: Number(raw._sum.total || 0),
        cantidad: Number(raw._sum.cantidad || 0),
      },
      _count: raw._count,
    };
  } catch {
    // Offline
  }

  const fmt = (n: number) =>
    n.toLocaleString("es-AR", { style: "currency", currency: "ARS" });

  const metodoBadgeVariant = (m: string): "success" | "info" | "warning" | "default" => {
    switch (m) {
      case "EFECTIVO": return "success";
      case "TRANSFERENCIA": return "info";
      case "TARJETA_DEBITO":
      case "TARJETA_CREDITO": return "warning";
      default: return "default";
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/dashboard"
            className="text-sm text-indigo-600 hover:underline"
          >
            ← Volver al inicio
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Ventas</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/ventas/dashboard">
            <Button variant="outline" size="sm">
              Dashboard
            </Button>
          </Link>
          <Link href="/dashboard/ventas/nuevo">
            <Button size="sm">Nueva Venta</Button>
          </Link>
        </div>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-slate-500">Ventas en período</p>
            <p className="text-2xl font-bold text-slate-900">{resumen._count}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-slate-500">Unidades vendidas</p>
            <p className="text-2xl font-bold text-slate-900">
              {Number(resumen._sum.cantidad || 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-slate-500">Total vendido</p>
            <p className="text-2xl font-bold text-emerald-600">
              {fmt(Number(resumen._sum.total || 0))}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Suspense>
        <VentasFilters
          fechaDesde={fechaDesde}
          fechaHasta={fechaHasta}
          metodoPago={metodoPago}
        />
      </Suspense>

      {/* Table */}
      <Card>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell>Fecha</TableHeadCell>
                <TableHeadCell>Cliente</TableHeadCell>
                <TableHeadCell>Producto</TableHeadCell>
                <TableHeadCell className="hidden sm:table-cell">
                  Talla/Color
                </TableHeadCell>
                <TableHeadCell className="hidden md:table-cell">
                  Método
                </TableHeadCell>
                <TableHeadCell className="text-right">Cant.</TableHeadCell>
                <TableHeadCell className="text-right">Total</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ventas.length === 0 ? (
                <TableEmpty
                  colSpan={7}
                  message="No hay ventas registradas en este período."
                />
              ) : (
                ventas.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>
                      <Link
                        href={`/dashboard/ventas/${v.id}`}
                        className="text-indigo-600 hover:underline"
                      >
                        {v.createdAt.toLocaleDateString("es-AR")}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {v.cliente?.nombre || (
                        <span className="text-slate-400">Sin cliente</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {v.tallaje.producto.nombre}
                      </span>
                      <span className="ml-1 text-xs text-slate-400">
                        {v.tallaje.producto.sku}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {v.tallaje.talla} / {v.tallaje.color}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant={metodoBadgeVariant(v.metodoPago)}>
                        {metodoPagoLabels[v.metodoPago] || v.metodoPago}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {v.cantidad}
                    </TableCell>
                    <TableCell className="text-right font-bold text-emerald-600">
                      {fmt(v.total.toNumber())}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

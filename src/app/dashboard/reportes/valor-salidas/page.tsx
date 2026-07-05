import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUsuarioAuth } from "@/lib/auth-helpers";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeadCell,
  TableCell,
  TableEmpty,
} from "@/components/ui/table";
import { ValorSalidasFilters } from "./filters";

export const metadata: Metadata = {
  title: "Reporte de Valor de Salidas",
};

interface MovimientoRow {
  tallajeId: string;
  cantidad: number;
  tallaje: {
    talla: string;
    color: string;
    precioEfectivo: { toNumber: () => number };
    precioTransferencia: { toNumber: () => number };
    producto: {
      nombre: string;
      sku: string;
      marca: string;
    };
  };
}

interface TotalRow {
  producto: { nombre: string; sku: string; marca: string };
  talla: string;
  color: string;
  cantidadTotal: number;
  valorEfectivo: number;
  valorTransferencia: number;
}

export default async function ValorSalidasPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const usuario = await requireUsuarioAuth();

  const fechaDesde =
    typeof params.fechaDesde === "string" ? params.fechaDesde : "";
  const fechaHasta =
    typeof params.fechaHasta === "string" ? params.fechaHasta : "";

  const where: Record<string, unknown> = {
    tipo: { in: ["SALIDA", "AJUSTE_NEG"] },
    tallaje: { producto: { empresaId: usuario.empresaId } },
  };

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

  let movimientos: MovimientoRow[] = [];

  try {
    movimientos = await prisma.movimiento.findMany({
      where,
      select: {
        tallajeId: true,
        cantidad: true,
        tallaje: {
          select: {
            talla: true,
            color: true,
            precioEfectivo: true,
            precioTransferencia: true,
            producto: {
              select: { nombre: true, sku: true, marca: true },
            },
          },
        },
      },
    });
  } catch {
    // Offline or DB error — render empty
  }

  const totalesMap = new Map<string, TotalRow>();

  for (const m of movimientos) {
    const key = m.tallajeId;
    const existing = totalesMap.get(key);

    const precioEfectivo = m.tallaje.precioEfectivo.toNumber();
    const precioTransferencia = m.tallaje.precioTransferencia.toNumber();

    if (existing) {
      existing.cantidadTotal += m.cantidad;
      existing.valorEfectivo += m.cantidad * precioEfectivo;
      existing.valorTransferencia += m.cantidad * precioTransferencia;
    } else {
      totalesMap.set(key, {
        producto: m.tallaje.producto,
        talla: m.tallaje.talla,
        color: m.tallaje.color,
        cantidadTotal: m.cantidad,
        valorEfectivo: m.cantidad * precioEfectivo,
        valorTransferencia: m.cantidad * precioTransferencia,
      });
    }
  }

  const totales = Array.from(totalesMap.values()).sort(
    (a, b) => b.valorEfectivo - a.valorEfectivo
  );

  const totalCantidad = totales.reduce((s, t) => s + t.cantidadTotal, 0);
  const totalEfectivo = totales.reduce((s, t) => s + t.valorEfectivo, 0);
  const totalTransferencia = totales.reduce(
    (s, t) => s + t.valorTransferencia,
    0
  );

  const fmt = (n: number) =>
    n.toLocaleString("es-AR", { style: "currency", currency: "ARS" });

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
          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            Reporte de Valor de Salidas
          </h1>
          <p className="text-sm text-slate-500">
            Total de lo que salió del stock, agrupado por tallaje
          </p>
        </div>
        <Link href="/dashboard/movimientos">
          <Button variant="outline" size="sm">
            Ver movimientos
          </Button>
        </Link>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-slate-500">Unidades totales salidas</p>
            <p className="text-2xl font-bold text-slate-900">{totalCantidad}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-slate-500">Valor total efectivo</p>
            <p className="text-2xl font-bold text-emerald-600">
              {fmt(totalEfectivo)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-slate-500">Valor total transferencia</p>
            <p className="text-2xl font-bold text-blue-600">
              {fmt(totalTransferencia)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Suspense>
        <ValorSalidasFilters
          fechaDesde={fechaDesde}
          fechaHasta={fechaHasta}
        />
      </Suspense>

      {/* Table */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-slate-900">
            Desglose por tallaje
          </h2>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell>Producto</TableHeadCell>
                <TableHeadCell className="hidden sm:table-cell">
                  Marca
                </TableHeadCell>
                <TableHeadCell>Talla / Color</TableHeadCell>
                <TableHeadCell className="text-right">Cant.</TableHeadCell>
                <TableHeadCell className="hidden md:table-cell text-right">
                  Total Efectivo
                </TableHeadCell>
                <TableHeadCell className="hidden md:table-cell text-right">
                  Total Transfer.
                </TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {totales.length === 0 ? (
                <TableEmpty
                  colSpan={6}
                  message="No hay salidas registradas en este período."
                />
              ) : (
                <>
                  {totales.map((t, i) => (
                    <TableRow key={`${t.producto.sku}-${t.talla}-${t.color}-${i}`}>
                      <TableCell>
                        <span className="font-medium">
                          {t.producto.nombre}
                        </span>
                        <span className="ml-1 text-xs text-slate-400">
                          {t.producto.sku}
                        </span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {t.producto.marca}
                      </TableCell>
                      <TableCell>
                        {t.talla} / {t.color}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {t.cantidadTotal}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-right text-emerald-600 font-medium">
                        {fmt(t.valorEfectivo)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-right text-blue-600 font-medium">
                        {fmt(t.valorTransferencia)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Totals row */}
                  <tr className="border-t-2 border-slate-300 bg-slate-50">
                    <td colSpan={3} className="px-3 py-3 text-sm font-bold text-slate-900 sm:px-6 sm:py-4">
                      TOTAL
                    </td>
                    <td className="px-3 py-3 text-right text-sm font-bold text-slate-900 sm:px-6 sm:py-4">
                      {totalCantidad}
                    </td>
                    <td className="hidden px-3 py-3 text-right text-sm font-bold text-emerald-600 md:table-cell sm:px-6 sm:py-4">
                      {fmt(totalEfectivo)}
                    </td>
                    <td className="hidden px-3 py-3 text-right text-sm font-bold text-blue-600 md:table-cell sm:px-6 sm:py-4">
                      {fmt(totalTransferencia)}
                    </td>
                  </tr>
                </>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

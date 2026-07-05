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
import { ProductFilters } from "./product-filters";
import { ExportProductosButton } from "./export-productos-button";
import { ReportButton } from "../components/report-button";
import { OfflineProductosList } from "../components/offline-productos-list";
import { OfflineAware } from "../components/offline-aware";

const ITEMS_PER_PAGE = 20;

export const metadata: Metadata = {
  title: "Productos",
};

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const usuario = await requireUsuarioAuth();

  const search = typeof params.search === "string" ? params.search : "";
  const categoria =
    typeof params.categoria === "string" ? params.categoria : "";
  const estado = typeof params.estado === "string" ? params.estado : "";
  const marca = typeof params.marca === "string" ? params.marca : "";
  const page = Math.max(1, parseInt(typeof params.page === "string" ? params.page : "1"));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let productos: Array<{ id: string; sku: string; nombre: string; marca: string; categoria: string; precio: any; activo: boolean; tallas: { stock: number }[] }> = [];
  let total = 0;
  let marcas: string[] = [];

  try {
    const where: Record<string, unknown> = {
      empresaId: usuario.empresaId,
    };

    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { marca: { contains: search, mode: "insensitive" } },
      ];
    }

    if (categoria) {
      where.categoria = categoria;
    }

    if (marca) {
      where.marca = marca;
    }

    if (estado === "activo") {
      where.activo = true;
    } else if (estado === "inactivo") {
      where.activo = false;
    }

    const [productosRaw, totalRaw, marcasRaw] = await Promise.all([
      prisma.producto.findMany({
        where,
        include: {
          tallas: { select: { stock: true } },
        },
        orderBy: { createdAt: "desc" },
        take: ITEMS_PER_PAGE,
        skip: (page - 1) * ITEMS_PER_PAGE,
      }),
      prisma.producto.count({ where }),
      prisma.producto.findMany({
        where: { empresaId: usuario.empresaId },
        select: { marca: true },
        distinct: ["marca"],
        orderBy: { marca: "asc" },
      }),
    ]);

    productos = productosRaw;
    total = totalRaw;
    marcas = marcasRaw.map((m) => m.marca);
  } catch {
    // Database unavailable (offline) — render with empty data, OfflineAware will show offline content
  }

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const getCategoriaBadge = (categoria: string) => {
    const variants: Record<
      string,
      "default" | "info" | "success" | "warning"
    > = {
      ZAPATILLAS: "info",
      BOTAS: "warning",
      SANDALIAS: "success",
      ZAPATOS: "default",
      DEPORTIVOS: "info",
      OTROS: "default",
    };
    return variants[categoria] || "default";
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Productos</h1>
        <div className="flex items-center gap-2">
          <ExportProductosButton
            filters={{ search, categoria, estado, marca }}
          />
          <ReportButton
            url="/api/reports/stock"
            filename={`stock_${new Date().toISOString().split("T")[0]}.pdf`}
            label="Reporte PDF"
          />
          <Link href="/dashboard/productos/nuevo">
            <Button>+ Nuevo Producto</Button>
          </Link>
        </div>
      </div>

      <OfflineAware
        onlineContent={
          <>
            <Suspense fallback={<div className="mb-4 h-10 w-full animate-pulse rounded-md bg-gray-100 sm:w-40" />}>
              <ProductFilters
                search={search}
                categoria={categoria}
                estado={estado}
                marca={marca}
                marcas={marcas}
              />
            </Suspense>

            <Card>
              <CardContent>
                <ResponsiveTable
                  data={productos}
                  emptyMessage={
                    search || categoria || estado || marca
                      ? "No se encontraron productos con esos filtros."
                      : "No hay productos. Creá tu primer producto."
                  }
                  emptyColSpan={7}
                  renderCard={(p) => {
                    const stockTotal = p.tallas.reduce(
                      (acc, t) => acc + t.stock,
                      0
                    );
                    return (
                      <Link
                        key={p.id}
                        href={`/dashboard/productos/${p.id}`}
                        className="block px-4 py-3 hover:bg-slate-50"
                      >
                        <div className="font-mono text-sm text-indigo-600 hover:underline">
                          {p.sku}
                        </div>
                        <div className="truncate font-medium text-slate-900">
                          {p.nombre}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                          <Badge variant={getCategoriaBadge(p.categoria)}>
                            {p.categoria}
                          </Badge>
                          <span>·</span>
                          <Badge variant={p.activo ? "success" : "danger"}>
                            {p.activo ? "Activo" : "Inactivo"}
                          </Badge>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-sm">
                          <span className="text-slate-700">
                            ${p.precio.toFixed(2)}
                          </span>
                          <span className="text-slate-500">
                            Stock: {stockTotal}
                          </span>
                        </div>
                      </Link>
                    );
                  }}
                  tableHead={
                    <TableRow>
                      <TableHeadCell>SKU</TableHeadCell>
                      <TableHeadCell>Nombre</TableHeadCell>
                      <TableHeadCell className="hidden md:table-cell">Marca</TableHeadCell>
                      <TableHeadCell className="hidden md:table-cell">Categoría</TableHeadCell>
                      <TableHeadCell className="hidden sm:table-cell">Precio</TableHeadCell>
                      <TableHeadCell>Stock</TableHeadCell>
                      <TableHeadCell className="hidden sm:table-cell">Estado</TableHeadCell>
                    </TableRow>
                  }
                  tableBody={(p) => {
                    const stockTotal = p.tallas.reduce(
                      (acc, t) => acc + t.stock,
                      0
                    );
                    return (
                      <TableRow key={p.id}>
                        <TableCell>
                          <Link
                            href={`/dashboard/productos/${p.id}`}
                            className="font-mono text-indigo-600 hover:underline"
                          >
                            {p.sku}
                          </Link>
                        </TableCell>
                        <TableCell className="font-medium">
                          {p.nombre}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{p.marca}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant={getCategoriaBadge(p.categoria)}>
                            {p.categoria}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">${p.precio.toFixed(2)}</TableCell>
                        <TableCell>{stockTotal}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant={p.activo ? "success" : "danger"}>
                            {p.activo ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  }}
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
        offlineContent={<OfflineProductosList />}
      />
    </div>
  );
}

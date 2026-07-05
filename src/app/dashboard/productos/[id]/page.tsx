import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUsuarioAuth } from "@/lib/auth-helpers";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { ToggleActivoButton } from "./toggle-activo-button";
import { TallajeManager } from "./tallaje-manager";
import { ExportStockButton } from "./export-stock-button";

export default async function ProductoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const usuario = await requireUsuarioAuth();

  const producto = await prisma.producto.findFirst({
    where: { id, empresaId: usuario.empresaId },
    include: { tallas: { orderBy: { talla: "asc" } } },
  });

  if (!producto) notFound();

  const stockTotal = producto.tallas.reduce((acc, t) => acc + t.stock, 0);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <Link
          href="/dashboard/productos"
          className="text-sm text-indigo-600 hover:underline"
        >
          ← Volver a productos
        </Link>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">
              {producto.nombre}
            </h1>
            <Badge variant={producto.activo ? "success" : "danger"}>
              {producto.activo ? "Activo" : "Inactivo"}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {producto.sku} · {producto.marca} · {producto.modelo}
          </p>
        </div>
        <div className="flex gap-2">
          <ExportStockButton
            productoId={producto.id}
            productoNombre={producto.nombre}
          />
          <Link href={`/dashboard/productos/${producto.id}/editar`}>
            <Button variant="secondary" size="sm">
              Editar
            </Button>
          </Link>
          <ToggleActivoButton
            productoId={producto.id}
            activo={producto.activo}
          />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent>
            <p className="text-sm text-slate-500">Precio</p>
            <p className="text-2xl font-bold text-slate-900">
              ${producto.precio.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-slate-500">Stock total</p>
            <p className="text-2xl font-bold text-slate-900">{stockTotal}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-slate-500">Talles</p>
            <p className="text-2xl font-bold text-slate-900">
              {producto.tallas.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {producto.descripcion && (
        <Card className="mb-6">
          <CardContent>
            <p className="text-sm text-slate-500">Descripción</p>
            <p className="mt-1 text-slate-700">{producto.descripcion}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Talles y Stock
            </h2>
            <TallajeManager productoId={producto.id} mode="create" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell>Talla</TableHeadCell>
                <TableHeadCell>Color</TableHeadCell>
                <TableHeadCell>Stock</TableHeadCell>
                <TableHeadCell className="hidden sm:table-cell">Stock Mínimo</TableHeadCell>
                <TableHeadCell className="hidden sm:table-cell">Estado</TableHeadCell>
                <TableHeadCell className="text-right">Acciones</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {producto.tallas.length === 0 ? (
                <TableEmpty
                  colSpan={6}
                  message="No hay talles registrados. Agregá uno."
                />
              ) : (
                producto.tallas.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.talla}</TableCell>
                    <TableCell>{t.color}</TableCell>
                    <TableCell>{t.stock}</TableCell>
                    <TableCell className="hidden sm:table-cell">{t.stockMinimo}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge
                        variant={
                          t.stock <= t.stockMinimo ? "danger" : "success"
                        }
                      >
                        {t.stock <= t.stockMinimo ? "Bajo" : "Normal"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <TallajeManager
                        productoId={producto.id}
                        tallaje={t}
                        mode="edit"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

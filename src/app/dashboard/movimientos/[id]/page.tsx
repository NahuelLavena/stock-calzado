import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUsuarioAuth } from "@/lib/auth-helpers";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MovimientoActions } from "./movimiento-actions";

const tipoLabels: Record<string, string> = {
  ENTRADA: "Entrada",
  SALIDA: "Salida",
  AJUSTE_POS: "Ajuste positivo",
  AJUSTE_NEG: "Ajuste negativo",
  DEVOLUCION: "Devolución",
};

const tipoVariants: Record<
  string,
  "success" | "danger" | "warning" | "info" | "default"
> = {
  ENTRADA: "success",
  SALIDA: "danger",
  AJUSTE_POS: "info",
  AJUSTE_NEG: "warning",
  DEVOLUCION: "default",
};

export default async function MovimientoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const usuario = await requireUsuarioAuth();

  const movimiento = await prisma.movimiento.findFirst({
    where: {
      id,
      usuario: { empresaId: usuario.empresaId },
    },
    include: {
      usuario: { select: { nombre: true, email: true } },
      tallaje: {
        include: {
          producto: {
            select: { nombre: true, sku: true, marca: true },
          },
        },
      },
    },
  });

  if (!movimiento) notFound();

  const esEntrada =
    movimiento.tipo === "ENTRADA" ||
    movimiento.tipo === "DEVOLUCION" ||
    movimiento.tipo === "AJUSTE_POS";

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link
          href="/dashboard/movimientos"
          className="text-sm text-indigo-600 hover:underline"
        >
          ← Volver a movimientos
        </Link>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">
            Detalle del Movimiento
          </h1>
          <Badge variant={tipoVariants[movimiento.tipo]}>
            {tipoLabels[movimiento.tipo]}
          </Badge>
        </div>
        <MovimientoActions id={movimiento.id} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardContent>
            <p className="text-sm text-slate-500">Producto</p>
            <p className="mt-1 font-semibold text-slate-900">
              {movimiento.tallaje.producto.nombre}
            </p>
            <p className="text-sm text-slate-500">
              {movimiento.tallaje.producto.sku} ·{" "}
              {movimiento.tallaje.producto.marca}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <p className="text-sm text-slate-500">Talla / Color</p>
            <p className="mt-1 font-semibold text-slate-900">
              {movimiento.tallaje.talla} · {movimiento.tallaje.color}
            </p>
            <p className="text-sm text-slate-500">
              Stock actual: {movimiento.tallaje.stock} unidades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <p className="text-sm text-slate-500">Cantidad</p>
            <p
              className={`mt-1 text-3xl font-bold ${esEntrada ? "text-emerald-600" : "text-rose-600"}`}
            >
              {esEntrada ? "+" : "-"}
              {movimiento.cantidad}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <p className="text-sm text-slate-500">Fecha y hora</p>
            <p className="mt-1 font-semibold text-slate-900">
              {new Date(movimiento.createdAt).toLocaleDateString("es-AR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <p className="text-sm text-slate-500">Realizado por</p>
            <p className="mt-1 font-semibold text-slate-900">
              {movimiento.usuario.nombre}
            </p>
            <p className="text-sm text-slate-500">
              {movimiento.usuario.email}
            </p>
          </CardContent>
        </Card>

        {movimiento.motivo && (
          <Card>
            <CardContent>
              <p className="text-sm text-slate-500">Motivo</p>
              <p className="mt-1 text-slate-700">{movimiento.motivo}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mt-6">
        <Link
          href="/dashboard/movimientos"
          className="text-sm text-indigo-600 hover:underline"
        >
          ← Volver a movimientos
        </Link>
      </div>
    </div>
  );
}

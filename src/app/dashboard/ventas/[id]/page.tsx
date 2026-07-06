import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUsuarioAuth } from "@/lib/auth-helpers";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { metodoPagoLabels } from "@/lib/validations/venta";

export default async function VentaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const usuario = await requireUsuarioAuth();

  let venta: {
    id: string;
    metodoPago: string;
    cantidad: number;
    precioUnitario: { toNumber: () => number };
    total: { toNumber: () => number };
    motivo: string | null;
    createdAt: Date;
    cliente: { nombre: string; telefono: string | null; email: string | null } | null;
    usuario: { nombre: string; email: string };
    tallaje: {
      talla: string;
      color: string;
      stock: number;
      producto: {
        nombre: string;
        sku: string;
        marca: string;
        categoria: string;
        precioCosto: { toNumber: () => number } | null;
      };
    };
  } | null = null;

  try {
    venta = await prisma.venta.findFirst({
      where: { id, empresaId: usuario.empresaId },
      include: {
        cliente: true,
        usuario: { select: { nombre: true, email: true } },
        tallaje: {
          include: {
            producto: {
              select: {
                nombre: true,
                sku: true,
                marca: true,
                categoria: true,
                precioCosto: true,
              },
            },
          },
        },
      },
    });
  } catch {
    notFound();
  }

  if (!venta) notFound();

  const precioCosto = venta.tallaje.producto.precioCosto?.toNumber() ?? null;
  const ganancia = precioCosto != null
    ? (venta.precioUnitario.toNumber() - precioCosto) * venta.cantidad
    : null;

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
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <Link
          href="/dashboard/ventas"
          className="text-sm text-indigo-600 hover:underline"
        >
          ← Volver a ventas
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          Detalle de Venta
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Sale info */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-900">
              Información de la venta
            </h2>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-slate-500">Fecha y hora</p>
              <p className="font-medium text-slate-900">
                {venta.createdAt.toLocaleDateString("es-AR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Método de pago</p>
              <Badge variant={metodoBadgeVariant(venta.metodoPago)}>
                {metodoPagoLabels[venta.metodoPago] || venta.metodoPago}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-slate-500">Realizado por</p>
              <p className="font-medium text-slate-900">
                {venta.usuario.nombre}
              </p>
              <p className="text-sm text-slate-500">{venta.usuario.email}</p>
            </div>
            {venta.motivo && (
              <div>
                <p className="text-sm text-slate-500">Motivo</p>
                <p className="font-medium text-slate-900">{venta.motivo}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Client info */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-900">Cliente</h2>
          </CardHeader>
          <CardContent>
            {venta.cliente ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-500">Nombre</p>
                  <p className="font-medium text-slate-900">
                    {venta.cliente.nombre}
                  </p>
                </div>
                {venta.cliente.telefono && (
                  <div>
                    <p className="text-sm text-slate-500">Teléfono</p>
                    <p className="font-medium text-slate-900">
                      {venta.cliente.telefono}
                    </p>
                  </div>
                )}
                {venta.cliente.email && (
                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="font-medium text-slate-900">
                      {venta.cliente.email}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-500">Venta sin cliente registrado</p>
            )}
          </CardContent>
        </Card>

        {/* Product info */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-900">
              Producto
            </h2>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-slate-500">Producto</p>
              <p className="font-medium text-slate-900">
                {venta.tallaje.producto.nombre}
              </p>
              <p className="text-sm text-slate-500">
                {venta.tallaje.producto.sku} · {venta.tallaje.producto.marca}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Talla / Color</p>
              <p className="font-medium text-slate-900">
                {venta.tallaje.talla} / {venta.tallaje.color}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Stock actual</p>
              <p className="font-medium text-slate-900">
                {venta.tallaje.stock} unidades
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Financial info */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-900">
              Resumen financiero
            </h2>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Precio unitario</span>
              <span className="font-medium text-slate-900">
                {fmt(venta.precioUnitario.toNumber())}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Cantidad</span>
              <span className="font-medium text-slate-900">
                {venta.cantidad}
              </span>
            </div>
            <div className="border-t border-slate-200 pt-3 flex justify-between">
              <span className="text-sm font-medium text-slate-900">Total</span>
              <span className="text-xl font-bold text-emerald-600">
                {fmt(venta.total.toNumber())}
              </span>
            </div>
            {ganancia != null && (
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Ganancia</span>
                <span className="font-bold text-amber-600">
                  {fmt(ganancia)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

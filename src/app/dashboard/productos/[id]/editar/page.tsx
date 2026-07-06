import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUsuarioAuth } from "@/lib/auth-helpers";
import { EditarProductoForm } from "./editar-producto-form";

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const usuario = await requireUsuarioAuth();

  const producto = await prisma.producto.findFirst({
    where: { id, empresaId: usuario.empresaId },
  });

  if (!producto) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link
          href={`/dashboard/productos/${producto.id}`}
          className="text-sm text-indigo-600 hover:underline"
        >
          ← Volver al producto
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          Editar Producto
        </h1>
      </div>

      <EditarProductoForm
        producto={{
          ...producto,
          precio: producto.precio != null ? Number(producto.precio) : null,
          precioCosto: producto.precioCosto != null ? Number(producto.precioCosto) : null,
        }}
      />
    </div>
  );
}

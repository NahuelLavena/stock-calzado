import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getUsuarioActual } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { UsuarioEditForm } from "./usuario-edit-form";

export default async function UsuarioDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const usuario = await getUsuarioActual();

  if (!usuario) redirect("/dashboard");
  if (usuario.rol !== "ADMIN") redirect("/dashboard");

  const target = await prisma.usuario.findUnique({
    where: { id },
    select: {
      id: true,
      nombre: true,
      email: true,
      rol: true,
      empresaId: true,
      puedeEditarStock: true,
    },
  });

  if (!target || target.empresaId !== usuario.empresaId) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link
          href="/dashboard/usuarios"
          className="text-sm text-indigo-600 hover:underline"
        >
          ← Volver a usuarios
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          Editar Usuario
        </h1>
      </div>

      <UsuarioEditForm
        usuario={{
          id: target.id,
          nombre: target.nombre,
          email: target.email,
          rol: target.rol,
          puedeEditarStock: target.puedeEditarStock,
          esAdminActual: usuario.id === target.id,
        }}
      />
    </div>
  );
}

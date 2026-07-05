import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUsuarioActual } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { TableRow, TableHeadCell, TableCell } from "@/components/ui/table";

const rolLabels: Record<string, string> = {
  ADMIN: "Administrador",
  VENDEDOR: "Vendedor",
  ALMACENERO: "Almacenero",
};

const rolVariants: Record<string, "danger" | "info" | "default"> = {
  ADMIN: "danger",
  VENDEDOR: "info",
  ALMACENERO: "default",
};

export const metadata: Metadata = {
  title: "Usuarios",
};

export default async function UsuariosPage() {
  const usuario = await getUsuarioActual();

  if (!usuario) redirect("/dashboard");
  if (usuario.rol !== "ADMIN") redirect("/dashboard");

  const usuarios = await prisma.usuario.findMany({
    where: { empresaId: usuario.empresaId },
    select: {
      id: true,
      nombre: true,
      email: true,
      rol: true,
      puedeEditarStock: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Usuarios</h1>
        <Link href="/dashboard/usuarios/nuevo">
          <Button>+ Nuevo Usuario</Button>
        </Link>
      </div>

      <Card>
        <CardContent>
          <ResponsiveTable
            data={usuarios}
            emptyMessage="No hay usuarios registrados."
            emptyColSpan={5}
            renderCard={(u) => (
              <Link
                key={u.id}
                href={`/dashboard/usuarios/${u.id}`}
                className="block px-4 py-3 hover:bg-slate-50"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-indigo-600">{u.nombre}</span>
                  <Badge variant={rolVariants[u.rol]}>{rolLabels[u.rol]}</Badge>
                </div>
                <div className="mt-1 text-sm text-slate-500">{u.email}</div>
                <div className="mt-1 text-sm text-slate-500">
                  Editar stock:{" "}
                  {u.rol === "ADMIN" ? (
                    <span className="text-slate-400">Siempre</span>
                  ) : u.puedeEditarStock ? (
                    <Badge variant="success">Sí</Badge>
                  ) : (
                    <Badge variant="default">No</Badge>
                  )}
                </div>
                <div className="mt-1 text-sm text-slate-500">
                  Creado: {new Date(u.createdAt).toLocaleDateString("es-AR")}
                </div>
              </Link>
            )}
            tableHead={
              <TableRow>
                <TableHeadCell>Nombre</TableHeadCell>
                <TableHeadCell className="hidden sm:table-cell">Email</TableHeadCell>
                <TableHeadCell>Rol</TableHeadCell>
                <TableHeadCell className="hidden md:table-cell">Editar Stock</TableHeadCell>
                <TableHeadCell className="hidden lg:table-cell">Creado</TableHeadCell>
              </TableRow>
            }
            tableBody={(u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <Link
                    href={`/dashboard/usuarios/${u.id}`}
                    className="font-medium text-indigo-600 hover:underline"
                  >
                    {u.nombre}
                  </Link>
                </TableCell>
                <TableCell className="hidden sm:table-cell">{u.email}</TableCell>
                <TableCell>
                  <Badge variant={rolVariants[u.rol]}>
                    {rolLabels[u.rol]}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {u.rol === "ADMIN" ? (
                    <span className="text-sm text-slate-400">Siempre</span>
                  ) : u.puedeEditarStock ? (
                    <Badge variant="success">Sí</Badge>
                  ) : (
                    <Badge variant="default">No</Badge>
                  )}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {new Date(u.createdAt).toLocaleDateString("es-AR")}
                </TableCell>
              </TableRow>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}

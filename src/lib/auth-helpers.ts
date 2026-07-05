import { redirect } from "next/navigation";
import { getUsuarioActual } from "@/lib/session";
import { prisma } from "@/lib/prisma";

type Rol = "ADMIN" | "VENDEDOR" | "ALMACENERO";

export async function requireUsuarioAuth() {
  const usuario = await getUsuarioActual();
  if (!usuario) {
    redirect("/login");
  }
  return usuario;
}

export async function requireRole(rol: Rol) {
  const usuario = await requireUsuarioAuth();
  if (usuario.rol !== rol) {
    throw new Error("No autorizado");
  }
  return usuario;
}

export async function requireAdmin() {
  return requireRole("ADMIN");
}

export async function requirePermStock() {
  const usuario = await requireUsuarioAuth();
  if (usuario.rol !== "ADMIN" && !usuario.puedeEditarStock) {
    throw new Error("No tenés permiso para editar stock");
  }
  return usuario;
}

export async function getProductoByEmpresa(productoId: string) {
  const usuario = await requireUsuarioAuth();
  const producto = await prisma.producto.findFirst({
    where: { id: productoId, empresaId: usuario.empresaId },
  });
  if (!producto) {
    throw new Error("Producto no encontrado");
  }
  return { producto, usuario };
}

export async function getTallajeByEmpresa(tallajeId: string) {
  const usuario = await requireUsuarioAuth();
  const tallaje = await prisma.tallaje.findFirst({
    where: {
      id: tallajeId,
      producto: { empresaId: usuario.empresaId },
    },
  });
  if (!tallaje) {
    throw new Error("Talle no encontrado");
  }
  return { tallaje, usuario };
}

export async function getMovimientoByEmpresa(movimientoId: string) {
  const usuario = await requireUsuarioAuth();
  const movimiento = await prisma.movimiento.findFirst({
    where: {
      id: movimientoId,
      usuario: { empresaId: usuario.empresaId },
    },
    include: { tallaje: true },
  });
  if (!movimiento) {
    throw new Error("Movimiento no encontrado");
  }
  return { movimiento, usuario };
}

export async function getUsuarioById(id: string) {
  const usuario = await requireUsuarioAuth();
  const target = await prisma.usuario.findUnique({ where: { id } });
  if (!target) {
    throw new Error("Usuario no encontrado");
  }
  if (target.empresaId !== usuario.empresaId) {
    throw new Error("No autorizado");
  }
  return { target, usuario };
}

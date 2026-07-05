import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUsuarioActual } from "@/lib/session";

export async function GET() {
  const usuario = await getUsuarioActual();
  if (!usuario) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const [productos, tallas, movimientos] = await prisma.$transaction([
    prisma.producto.findMany({
      where: { empresaId: usuario.empresaId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.tallaje.findMany({
      where: { producto: { empresaId: usuario.empresaId } },
    }),
    prisma.movimiento.findMany({
      where: { usuario: { empresaId: usuario.empresaId } },
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
  ]);

  return NextResponse.json({
    productos: productos.map((p) => ({
      ...p,
      precio: Number(p.precio),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    })),
    tallas: tallas.map((t) => ({
      id: t.id,
      productoId: t.productoId,
      talla: t.talla,
      color: t.color,
      stock: t.stock,
      stockMinimo: t.stockMinimo,
    })),
    movimientos: movimientos.map((m) => ({
      ...m,
      cantidad: m.cantidad,
      createdAt: m.createdAt.toISOString(),
    })),
  });
}

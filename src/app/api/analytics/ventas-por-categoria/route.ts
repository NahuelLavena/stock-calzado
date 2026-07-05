import { NextResponse } from "next/server";
import { getUsuarioActual } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const usuario = await getUsuarioActual();
  if (!usuario) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const empresaId = usuario.empresaId;

  const movimientos = await prisma.movimiento.findMany({
    where: {
      usuario: { empresaId },
      tipo: { in: ["SALIDA", "AJUSTE_NEG"] },
    },
    include: {
      tallaje: {
        include: {
          producto: {
            select: { categoria: true, marca: true },
          },
        },
        select: { precioEfectivo: true },
      },
    },
  });

  const categoriaMap = new Map<string, { cantidad: number; valor: number }>();
  const marcaMap = new Map<string, { cantidad: number; valor: number }>();

  movimientos.forEach((m) => {
    const { categoria, marca } = m.tallaje.producto;
    const valor = m.cantidad * Number(m.tallaje.precioEfectivo);

    const catActual = categoriaMap.get(categoria) ?? { cantidad: 0, valor: 0 };
    categoriaMap.set(categoria, {
      cantidad: catActual.cantidad + m.cantidad,
      valor: catActual.valor + valor,
    });

    const marcaActual = marcaMap.get(marca) ?? { cantidad: 0, valor: 0 };
    marcaMap.set(marca, {
      cantidad: marcaActual.cantidad + m.cantidad,
      valor: marcaActual.valor + valor,
    });
  });

  const categorias = Array.from(categoriaMap.entries())
    .map(([nombre, datos]) => ({ nombre, ...datos }))
    .sort((a, b) => b.cantidad - a.cantidad);

  const marcas = Array.from(marcaMap.entries())
    .map(([nombre, datos]) => ({ nombre, ...datos }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 10);

  return NextResponse.json({ categorias, marcas });
}

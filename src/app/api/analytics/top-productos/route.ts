import { NextResponse } from "next/server";
import { getUsuarioActual } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const usuario = await getUsuarioActual();
  if (!usuario) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const empresaId = usuario.empresaId;

  const hace6Meses = new Date();
  hace6Meses.setMonth(hace6Meses.getMonth() - 6);

  const topProductos = await prisma.movimiento.groupBy({
    by: ["tallajeId"],
    where: {
      usuario: { empresaId },
      tipo: { in: ["SALIDA", "AJUSTE_NEG"] },
      createdAt: { gte: hace6Meses },
    },
    _sum: { cantidad: true },
    orderBy: { _sum: { cantidad: "desc" } },
    take: 10,
  });

  const tallajeIds = topProductos.map((t) => t.tallajeId);

  const tallajes = await prisma.tallaje.findMany({
    where: { id: { in: tallajeIds } },
    include: {
      producto: {
        select: {
          nombre: true,
          sku: true,
          marca: true,
          categoria: true,
        },
      },
    },
  });

  const tallajeMap = new Map(tallajes.map((t) => [t.id, t]));

  const productos = topProductos
    .map((t) => {
      const tallaje = tallajeMap.get(t.tallajeId);
      if (!tallaje) return null;
      return {
        nombre: tallaje.producto.nombre,
        sku: tallaje.producto.sku,
        marca: tallaje.producto.marca,
        categoria: tallaje.producto.categoria,
        totalVendido: t._sum.cantidad ?? 0,
      };
    })
    .filter(Boolean);

  return NextResponse.json({ productos });
}

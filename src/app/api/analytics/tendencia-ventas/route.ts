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

  const movimientos = await prisma.movimiento.findMany({
    where: {
      usuario: { empresaId },
      tipo: { in: ["SALIDA", "AJUSTE_NEG"] },
      createdAt: { gte: hace6Meses },
    },
    include: {
      tallaje: {
        include: {
          producto: { select: { precio: true } },
        },
      },
    },
  });

  const mesMap = new Map<string, { cantidad: number; valor: number }>();

  movimientos.forEach((m) => {
    const fecha = new Date(m.createdAt);
    const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
    const precio = Number(m.tallaje.producto.precio);
    const valor = m.cantidad * precio;

    const actual = mesMap.get(mes) ?? { cantidad: 0, valor: 0 };
    mesMap.set(mes, {
      cantidad: actual.cantidad + m.cantidad,
      valor: actual.valor + valor,
    });
  });

  const meses = Array.from(mesMap.entries())
    .map(([mes, datos]) => ({ mes, ...datos }))
    .sort((a, b) => a.mes.localeCompare(b.mes));

  return NextResponse.json({ tendencia: meses });
}

import { prisma } from "@/lib/prisma";

export async function checkStockBajo(tallajeId: string) {
  try {
    const tallaje = await prisma.tallaje.findUnique({
      where: { id: tallajeId },
      include: {
        producto: {
          select: { id: true, nombre: true, sku: true, empresaId: true },
        },
      },
    });

    if (!tallaje) return;
    if (tallaje.stock > tallaje.stockMinimo) return;

    const existing = await prisma.notificacion.findFirst({
      where: {
        empresaId: tallaje.producto.empresaId,
        tipo: "STOCK_BAJO",
        leido: false,
        mensaje: { contains: tallaje.producto.sku },
      },
    });

    if (existing) return;

    await prisma.notificacion.create({
      data: {
        empresaId: tallaje.producto.empresaId,
        tipo: "STOCK_BAJO",
        titulo: "Stock bajo",
        mensaje: `${tallaje.producto.nombre} (${tallaje.producto.sku}) — Talla ${tallaje.talla} ${tallaje.color}: ${tallaje.stock} unidades (mínimo: ${tallaje.stockMinimo})`,
      },
    });
  } catch {
    // Silently fail — notifications are non-critical
  }
}

export async function getNoLeidasCount(empresaId: string): Promise<number> {
  try {
    return await prisma.notificacion.count({
      where: { empresaId, leido: false },
    });
  } catch {
    return 0;
  }
}

export async function getNotificaciones(empresaId: string, limit = 20) {
  try {
    return await prisma.notificacion.findMany({
      where: { empresaId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  } catch {
    return [];
  }
}

export async function marcarLeida(notificacionId: string, empresaId: string) {
  try {
    await prisma.notificacion.update({
      where: { id: notificacionId, empresaId },
      data: { leido: true },
    });
  } catch {
    // Silently fail
  }
}

export async function marcarTodasLeidas(empresaId: string) {
  try {
    await prisma.notificacion.updateMany({
      where: { empresaId, leido: false },
      data: { leido: true },
    });
  } catch {
    // Silently fail
  }
}

import { NextResponse } from "next/server";
import { getUsuarioActual } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const usuario = await getUsuarioActual();
    if (!usuario) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const empresaId = usuario.empresaId;

    // Last 30 days
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);

    // Current month start
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const hoy = new Date();
    hoy.setHours(23, 59, 59, 999);

    const [
      ventasMes,
      ventasHoy,
      ventasPorDia,
      ventasPorMetodoPago,
      topProductos,
      ventasPorCategoria,
    ] = await Promise.all([
      // Monthly summary
      prisma.venta.aggregate({
        where: { empresaId, createdAt: { gte: inicioMes, lte: hoy } },
        _sum: { total: true, cantidad: true },
        _count: true,
      }),

      // Today summary
      prisma.venta.aggregate({
        where: {
          empresaId,
          createdAt: {
            gte: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()),
            lte: hoy,
          },
        },
        _sum: { total: true, cantidad: true },
        _count: true,
      }),

      // Daily trend (last 30 days)
      prisma.venta.findMany({
        where: { empresaId, createdAt: { gte: hace30Dias } },
        select: { createdAt: true, total: true, cantidad: true },
      }),

      // By payment method
      prisma.venta.groupBy({
        by: ["metodoPago"],
        where: { empresaId, createdAt: { gte: inicioMes, lte: hoy } },
        _sum: { total: true, cantidad: true },
        _count: true,
      }),

      // Top products
      prisma.venta.groupBy({
        by: ["tallajeId"],
        where: { empresaId, createdAt: { gte: inicioMes, lte: hoy } },
        _sum: { total: true, cantidad: true },
        orderBy: { _sum: { total: "desc" } },
        take: 10,
      }),

      // By category
      prisma.venta.findMany({
        where: { empresaId, createdAt: { gte: inicioMes, lte: hoy } },
        select: {
          cantidad: true,
          total: true,
          tallaje: {
            select: {
              producto: { select: { categoria: true } },
            },
          },
        },
      }),
    ]);

    // Process daily trend
    const diaMap = new Map<string, { cantidad: number; valor: number }>();
    for (const v of ventasPorDia) {
      const fecha = new Date(v.createdAt);
      const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;
      const existing = diaMap.get(key) ?? { cantidad: 0, valor: 0 };
      diaMap.set(key, {
        cantidad: existing.cantidad + v.cantidad,
        valor: existing.valor + Number(v.total),
      });
    }
    const tendencia = Array.from(diaMap.entries())
      .map(([fecha, datos]) => ({ fecha, ...datos }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha));

    // Process by payment method
    const metodoPago = ventasPorMetodoPago.map((v) => ({
      metodo: v.metodoPago,
      cantidad: v._sum.cantidad ?? 0,
      valor: Number(v._sum.total ?? 0),
      count: v._count,
    }));

    // Process top products
    const tallajeIds = topProductos.map((t) => t.tallajeId);
    const tallajes = tallajeIds.length > 0
      ? await prisma.tallaje.findMany({
          where: { id: { in: tallajeIds } },
          include: {
            producto: { select: { nombre: true, sku: true, marca: true } },
          },
        })
      : [];
    const tallajeMap = new Map(tallajes.map((t) => [t.id, t]));
    const topProducts = topProductos
      .map((t) => {
        const tallaje = tallajeMap.get(t.tallajeId);
        if (!tallaje) return null;
        return {
          nombre: tallaje.producto.nombre,
          sku: tallaje.producto.sku,
          marca: tallaje.producto.marca,
          talla: tallaje.talla,
          color: tallaje.color,
          cantidad: t._sum.cantidad ?? 0,
          valor: Number(t._sum.total ?? 0),
        };
      })
      .filter(Boolean);

    // Process by category
    const catMap = new Map<string, { cantidad: number; valor: number }>();
    for (const v of ventasPorCategoria) {
      const cat = v.tallaje.producto.categoria;
      const existing = catMap.get(cat) ?? { cantidad: 0, valor: 0 };
      catMap.set(cat, {
        cantidad: existing.cantidad + v.cantidad,
        valor: existing.valor + Number(v.total),
      });
    }
    const categorias = Array.from(catMap.entries())
      .map(([nombre, datos]) => ({ nombre, ...datos }))
      .sort((a, b) => b.valor - a.valor);

    const ticketPromedio =
      ventasMes._count > 0
        ? Number(ventasMes._sum.total || 0) / ventasMes._count
        : 0;

    return NextResponse.json({
      resumen: {
        hoy: {
          cantidad: ventasHoy._count,
          valor: Number(ventasHoy._sum.total || 0),
        },
        mes: {
          cantidad: ventasMes._count,
          valor: Number(ventasMes._sum.total || 0),
          unidades: Number(ventasMes._sum.cantidad || 0),
        },
        ticketPromedio,
      },
      tendencia,
      metodoPago,
      topProductos: topProducts,
      categorias,
    });
  } catch (error) {
    console.error("Error in ventas-dashboard API:", error);
    return NextResponse.json(
      { error: "Error al obtener datos" },
      { status: 500 }
    );
  }
}

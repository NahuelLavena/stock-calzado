"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getUsuarioActual } from "@/lib/session";
import { crearVentaSchema } from "@/lib/validations/venta";
import { checkStockBajo } from "@/lib/notifications";

type VentaState = { error: string } | { success: true } | null;

export async function crearVenta(
  _prevState: VentaState,
  formData: FormData
): Promise<VentaState> {
  const usuario = await getUsuarioActual();
  if (!usuario) return { error: "No autorizado" };
  if (usuario.rol === "ALMACENERO" && !usuario.puedeEditarStock) {
    return { error: "No tenés permiso para registrar ventas" };
  }

  const parsed = crearVentaSchema.safeParse({
    tallajeId: formData.get("tallajeId"),
    clienteId: formData.get("clienteId"),
    clienteNombre: formData.get("clienteNombre"),
    metodoPago: formData.get("metodoPago"),
    cantidad: formData.get("cantidad"),
    motivo: formData.get("motivo"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { tallajeId, clienteId, clienteNombre, metodoPago, cantidad, motivo } = parsed.data;

  // Must have either clienteId or clienteNombre
  if (!clienteId && !clienteNombre) {
    return { error: "Seleccioná un cliente o ingresá un nombre" };
  }

  // Verify tallaje belongs to user's empresa
  const tallaje = await prisma.tallaje.findFirst({
    where: {
      id: tallajeId,
      producto: { empresaId: usuario.empresaId },
    },
    include: { producto: true },
  });

  if (!tallaje) {
    return { error: "Talle no encontrado" };
  }

  // Validate stock
  if (tallaje.stock < cantidad) {
    return { error: `Stock insuficiente. Stock actual: ${tallaje.stock}` };
  }

  // Determine price based on payment method
  const precioUnitario =
    metodoPago === "EFECTIVO"
      ? Number(tallaje.precioEfectivo)
      : Number(tallaje.precioTransferencia);

  const total = precioUnitario * cantidad;

  // Create or get client
  let finalClienteId = clienteId || null;

  if (!finalClienteId && clienteNombre) {
    // Try to find existing client by name
    const existing = await prisma.cliente.findFirst({
      where: {
        empresaId: usuario.empresaId,
        nombre: { equals: clienteNombre, mode: "insensitive" },
      },
    });

    if (existing) {
      finalClienteId = existing.id;
    } else {
      // Create new client
      const newCliente = await prisma.cliente.create({
        data: {
          nombre: clienteNombre,
          empresaId: usuario.empresaId,
        },
      });
      finalClienteId = newCliente.id;
    }
  }

  // Create venta + movimiento + update stock in transaction (atomic)
  const result = await prisma.$transaction(async (tx) => {
    // Get next sale number for this company
    const lastVenta = await tx.venta.findFirst({
      where: { empresaId: usuario.empresaId },
      orderBy: { numero: "desc" },
      select: { numero: true },
    });
    const nextNumero = (lastVenta?.numero ?? 0) + 1;

    // Create movement
    const movimiento = await tx.movimiento.create({
      data: {
        tipo: "SALIDA",
        cantidad,
        motivo: motivo || `Venta - ${metodoPago}`,
        usuarioId: usuario.id,
        tallajeId,
      },
    });

    // Create venta
    const venta = await tx.venta.create({
      data: {
        empresaId: usuario.empresaId,
        clienteId: finalClienteId,
        usuarioId: usuario.id,
        tallajeId,
        metodoPago,
        cantidad,
        precioUnitario,
        total,
        motivo: motivo || null,
        movimientoId: movimiento.id,
        numero: nextNumero,
      },
    });

    // Atomic decrement with guard
    const stockResult = await tx.tallaje.updateMany({
      where: { id: tallajeId, stock: { gte: cantidad } },
      data: { stock: { decrement: cantidad } },
    });
    if (stockResult.count === 0) {
      throw new Error(`Stock insuficiente. Stock actual: ${tallaje.stock}`);
    }

    return { venta, movimiento };
  });

  const nuevoStock = tallaje.stock - cantidad;

  if (nuevoStock <= tallaje.stockMinimo) {
    await checkStockBajo(tallajeId);
  }

  redirect(`/dashboard/ventas/${result.venta.id}`);
}

export async function getVentas(params: {
  empresaId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  metodoPago?: string;
  clienteId?: string;
  page?: number;
}) {
  const usuario = await getUsuarioActual();
  if (!usuario) return { ventas: [], total: 0, totalPages: 0 };

  const empresaId = params.empresaId || usuario.empresaId;
  const { fechaDesde, fechaHasta, metodoPago, clienteId, page = 1 } = params;
  const ITEMS_PER_PAGE = 20;

  const where: Record<string, unknown> = { empresaId };

  if (fechaDesde || fechaHasta) {
    const createdAt: Record<string, Date> = {};
    if (fechaDesde) createdAt.gte = new Date(fechaDesde);
    if (fechaHasta) {
      const hasta = new Date(fechaHasta);
      hasta.setHours(23, 59, 59, 999);
      createdAt.lte = hasta;
    }
    where.createdAt = createdAt;
  }

  if (metodoPago) where.metodoPago = metodoPago;
  if (clienteId) where.clienteId = clienteId;

  const [ventas, total] = await Promise.all([
    prisma.venta.findMany({
      where,
      include: {
        cliente: { select: { id: true, nombre: true } },
        usuario: { select: { nombre: true } },
        tallaje: {
          include: {
            producto: { select: { nombre: true, sku: true, marca: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
    }),
    prisma.venta.count({ where }),
  ]);

  return { ventas: ventas.map((v) => ({
    ...v,
    precioUnitario: Number(v.precioUnitario),
    total: Number(v.total),
    tallaje: {
      ...v.tallaje,
      precioEfectivo: Number(v.tallaje.precioEfectivo),
      precioTransferencia: Number(v.tallaje.precioTransferencia),
    },
  })), total, totalPages: Math.ceil(total / ITEMS_PER_PAGE) };
}

export async function getVentaPorId(id: string, empresaId?: string) {
  const usuario = await getUsuarioActual();
  if (!usuario) return null;

  const eid = empresaId || usuario.empresaId;

  const venta = await prisma.venta.findFirst({
    where: { id, empresaId: eid },
    include: {
      cliente: true,
      usuario: { select: { nombre: true, email: true } },
      tallaje: {
        include: {
          producto: { select: { nombre: true, sku: true, marca: true, categoria: true } },
        },
      },
    },
  });

  if (!venta) return null;

  return {
    ...venta,
    precioUnitario: Number(venta.precioUnitario),
    total: Number(venta.total),
    tallaje: {
      ...venta.tallaje,
      precioEfectivo: Number(venta.tallaje.precioEfectivo),
      precioTransferencia: Number(venta.tallaje.precioTransferencia),
    },
  };
}

export async function getClientes(empresaId?: string) {
  const usuario = await getUsuarioActual();
  if (!usuario) return [];

  const id = empresaId || usuario.empresaId;

  return prisma.cliente.findMany({
    where: { empresaId: id },
    orderBy: { nombre: "asc" },
  });
}

export async function getResumenVentas(empresaId?: string) {
  const usuario = await getUsuarioActual();
  if (!usuario) return { hoy: { cantidad: 0, valor: 0 }, mes: { cantidad: 0, valor: 0, unidades: 0 }, ticketPromedio: 0 };

  const id = empresaId || usuario.empresaId;
  const hoy = new Date();
  hoy.setHours(23, 59, 59, 999);

  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

  const [ventasHoy, ventasMes, totalUnidadesMes] = await Promise.all([
    prisma.venta.aggregate({
      where: {
        empresaId: id,
        createdAt: { gte: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()), lte: hoy },
      },
      _sum: { total: true, cantidad: true },
      _count: true,
    }),
    prisma.venta.aggregate({
      where: { empresaId: id, createdAt: { gte: inicioMes, lte: hoy } },
      _sum: { total: true, cantidad: true },
      _count: true,
    }),
    prisma.venta.aggregate({
      where: { empresaId: id, createdAt: { gte: inicioMes, lte: hoy } },
      _sum: { cantidad: true },
    }),
  ]);

  const ticketPromedio = ventasMes._count > 0
    ? Number(ventasMes._sum.total || 0) / ventasMes._count
    : 0;

  return {
    hoy: {
      cantidad: ventasHoy._count,
      valor: Number(ventasHoy._sum.total || 0),
    },
    mes: {
      cantidad: ventasMes._count,
      valor: Number(ventasMes._sum.total || 0),
      unidades: Number(totalUnidadesMes._sum.cantidad || 0),
    },
    ticketPromedio,
  };
}

export async function anularVenta(
  ventaId: string
): Promise<{ error?: string }> {
  const usuario = await getUsuarioActual();
  if (!usuario) return { error: "No autorizado" };
  if (usuario.rol !== "ADMIN") return { error: "Solo administradores pueden anular ventas" };

  const venta = await prisma.venta.findFirst({
    where: { id: ventaId, empresaId: usuario.empresaId },
  });
  if (!venta) return { error: "Venta no encontrada" };

  // Atomic: increment stock back + delete venta + delete linked movimiento
  await prisma.$transaction(async (tx) => {
    // Restore stock
    await tx.tallaje.update({
      where: { id: venta.tallajeId },
      data: { stock: { increment: venta.cantidad } },
    });

    // Delete linked movement if exists
    if (venta.movimientoId) {
      await tx.movimiento.delete({ where: { id: venta.movimientoId } });
    }

    // Delete sale
    await tx.venta.delete({ where: { id: ventaId } });
  });

  return {};
}

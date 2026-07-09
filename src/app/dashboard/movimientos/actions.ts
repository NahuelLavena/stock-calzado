"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getUsuarioActual } from "@/lib/session";
import { crearMovimientoSchema, editarMovimientoSchema } from "@/lib/validations/movimiento";
import { checkStockBajo } from "@/lib/notifications";

type MovimientoState = { error: string } | { success: true } | null;

function canEditStock(usuario: { rol: string; puedeEditarStock: boolean }) {
  return usuario.rol === "ADMIN" || usuario.puedeEditarStock;
}

export async function crearMovimiento(
  _prevState: MovimientoState,
  formData: FormData
): Promise<MovimientoState> {
  const usuario = await getUsuarioActual();
  if (!usuario) return { error: "No autorizado" };
  if (!canEditStock(usuario)) {
    return { error: "No tenés permiso para crear movimientos" };
  }

  const parsed = crearMovimientoSchema.safeParse({
    tipo: formData.get("tipo"),
    cantidad: formData.get("cantidad"),
    motivo: formData.get("motivo"),
    tallajeId: formData.get("tallajeId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { tipo, cantidad, motivo, tallajeId } = parsed.data;

  // Verificar que el tallaje pertenece a la empresa del usuario
  const tallaje = await prisma.tallaje.findFirst({
    where: {
      id: tallajeId,
      producto: { empresaId: usuario.empresaId },
    },
  });

  if (!tallaje) {
    return { error: "Talle no encontrado" };
  }

  // Validar stock para salidas
  if (tipo === "SALIDA" || tipo === "AJUSTE_NEG") {
    if (tallaje.stock < cantidad) {
      return {
        error: `Stock insuficiente. Stock actual: ${tallaje.stock}`,
      };
    }
  }

  // Calcular nuevo stock
  let nuevoStock = tallaje.stock;
  switch (tipo) {
    case "ENTRADA":
    case "DEVOLUCION":
    case "AJUSTE_POS":
      nuevoStock += cantidad;
      break;
    case "SALIDA":
    case "AJUSTE_NEG":
      nuevoStock -= cantidad;
      break;
  }

  // Crear movimiento y actualizar stock en transacción
  await prisma.$transaction([
    prisma.movimiento.create({
      data: {
        tipo,
        cantidad,
        motivo: motivo || null,
        usuarioId: usuario.id,
        tallajeId,
      },
    }),
    prisma.tallaje.update({
      where: { id: tallajeId },
      data: { stock: nuevoStock },
    }),
  ]);

  if (nuevoStock <= tallaje.stockMinimo) {
    await checkStockBajo(tallajeId);
  }

  redirect("/dashboard/movimientos");
}

export async function getTallajesPorProducto(productoId: string) {
  const usuario = await getUsuarioActual();
  if (!usuario) return [];

  const tallas = await prisma.tallaje.findMany({
    where: {
      productoId,
      producto: { empresaId: usuario.empresaId },
    },
    orderBy: [{ talla: "asc" }, { color: "asc" }],
  });

  return tallas.map((t) => ({
    ...t,
    precioEfectivo: Number(t.precioEfectivo),
    precioTransferencia: Number(t.precioTransferencia),
  }));
}

export async function eliminarMovimiento(
  id: string
): Promise<{ error?: string }> {
  const usuario = await getUsuarioActual();
  if (!usuario) return { error: "No autorizado" };
  if (usuario.rol !== "ADMIN") return { error: "Solo administradores pueden eliminar movimientos" };

  const movimiento = await prisma.movimiento.findFirst({
    where: {
      id,
      usuario: { empresaId: usuario.empresaId },
    },
    include: { tallaje: true },
  });

  if (!movimiento) return { error: "Movimiento no encontrado" };

  let nuevoStock = movimiento.tallaje.stock;
  switch (movimiento.tipo) {
    case "ENTRADA":
    case "DEVOLUCION":
    case "AJUSTE_POS":
      nuevoStock -= movimiento.cantidad;
      break;
    case "SALIDA":
    case "AJUSTE_NEG":
      nuevoStock += movimiento.cantidad;
      break;
  }

  if (nuevoStock < 0) {
    return {
      error: `No se puede eliminar: el stock quedaría en ${nuevoStock} (insuficiente)`,
    };
  }

  await prisma.$transaction([
    prisma.tallaje.update({
      where: { id: movimiento.tallajeId },
      data: { stock: nuevoStock },
    }),
    prisma.movimiento.delete({ where: { id } }),
  ]);

  return {};
}

export async function editarMovimiento(
  _prevState: MovimientoState,
  formData: FormData
): Promise<MovimientoState> {
  const usuario = await getUsuarioActual();
  if (!usuario) return { error: "No autorizado" };
  if (!canEditStock(usuario)) {
    return { error: "No tenés permiso para editar movimientos" };
  }

  const parsed = editarMovimientoSchema.safeParse({
    id: formData.get("id"),
    tallajeId: formData.get("tallajeId"),
    tipo: formData.get("tipo"),
    cantidad: formData.get("cantidad"),
    motivo: formData.get("motivo"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { id, tallajeId, tipo, cantidad: cantidadNum, motivo } = parsed.data;
  const typedTipo = tipo;

  const movimiento = await prisma.movimiento.findFirst({
    where: {
      id,
      usuario: { empresaId: usuario.empresaId },
    },
    include: { tallaje: true },
  });

  if (!movimiento) return { error: "Movimiento no encontrado" };

  // Verificar que el nuevo tallaje pertenece a la empresa
  const nuevoTallaje = await prisma.tallaje.findFirst({
    where: {
      id: tallajeId,
      producto: { empresaId: usuario.empresaId },
    },
  });

  if (!nuevoTallaje) return { error: "Talle no encontrado" };

  // Revertir stock del movimiento viejo
  let stockDespuesRevertir = movimiento.tallaje.stock;
  switch (movimiento.tipo) {
    case "ENTRADA":
    case "DEVOLUCION":
    case "AJUSTE_POS":
      stockDespuesRevertir -= movimiento.cantidad;
      break;
    case "SALIDA":
    case "AJUSTE_NEG":
      stockDespuesRevertir += movimiento.cantidad;
      break;
  }

  // Calcular stock final según el nuevo movimiento
  let stockFinal = stockDespuesRevertir;
  const esMismoTallaje = movimiento.tallajeId === tallajeId;

  if (esMismoTallaje) {
    // Mismo tallaje: aplicar sobre el stock revertido
    switch (tipo) {
      case "ENTRADA":
      case "DEVOLUCION":
      case "AJUSTE_POS":
        stockFinal += cantidadNum;
        break;
      case "SALIDA":
      case "AJUSTE_NEG":
        stockFinal -= cantidadNum;
        break;
    }

    if (stockFinal < 0) {
      return {
        error: `Stock insuficiente. Stock disponible después de revertir: ${stockDespuesRevertir}`,
      };
    }
  } else {
    // Diferente tallaje: validar stock del tallaje viejo (revertir) y nuevo (aplicar)
    if (stockDespuesRevertir < 0) {
      return {
        error: `No se puede cambiar de talle: el stock del talle viejo quedaría en ${stockDespuesRevertir}`,
      };
    }

    let stockNuevoTallaje = nuevoTallaje.stock;
    switch (tipo) {
      case "ENTRADA":
      case "DEVOLUCION":
      case "AJUSTE_POS":
        stockNuevoTallaje += cantidadNum;
        break;
      case "SALIDA":
      case "AJUSTE_NEG":
        stockNuevoTallaje -= cantidadNum;
        break;
    }

    if (stockNuevoTallaje < 0) {
      return {
        error: `Stock insuficiente en el nuevo talle. Stock actual: ${nuevoTallaje.stock}`,
      };
    }

    // Actualizar ambos tallajes
    await prisma.$transaction([
      prisma.tallaje.update({
        where: { id: movimiento.tallajeId },
        data: { stock: stockDespuesRevertir },
      }),
      prisma.tallaje.update({
        where: { id: tallajeId },
        data: { stock: stockNuevoTallaje },
      }),
      prisma.movimiento.update({
        where: { id },
        data: {
          tipo: typedTipo,
          cantidad: cantidadNum,
          motivo: motivo || null,
          tallajeId,
        },
      }),
    ]);

    redirect("/dashboard/movimientos");
  }

  // Mismo tallaje: actualizar stock y movimiento
  await prisma.$transaction([
    prisma.tallaje.update({
      where: { id: tallajeId },
      data: { stock: stockFinal },
    }),
    prisma.movimiento.update({
      where: { id },
      data: {
        tipo: typedTipo,
        cantidad: cantidadNum,
        motivo: motivo || null,
      },
    }),
  ]);

  redirect(`/dashboard/movimientos/${id}`);
}

export async function getMovimientoPorId(id: string) {
  const usuario = await getUsuarioActual();
  if (!usuario) return null;

  const movimiento = await prisma.movimiento.findFirst({
    where: {
      id,
      usuario: { empresaId: usuario.empresaId },
    },
    include: {
      tallaje: {
        include: {
          producto: { select: { id: true, nombre: true, sku: true } },
        },
      },
    },
  });

  if (!movimiento) return null;

  return {
    ...movimiento,
    tallaje: {
      ...movimiento.tallaje,
      precioEfectivo: Number(movimiento.tallaje.precioEfectivo),
      precioTransferencia: Number(movimiento.tallaje.precioTransferencia),
    },
  };
}

export async function getProductosConTallajes() {
  const usuario = await getUsuarioActual();
  if (!usuario) return [];

  const productos = await prisma.producto.findMany({
    where: {
      empresaId: usuario.empresaId,
      activo: true,
    },
    include: {
      tallas: {
        orderBy: [{ talla: "asc" }, { color: "asc" }],
      },
    },
    orderBy: { nombre: "asc" },
  });

  return productos.map((p) => ({
    ...p,
    precio: p.precio != null ? Number(p.precio) : null,
    precioCosto: p.precioCosto != null ? Number(p.precioCosto) : null,
    tallas: p.tallas.map((t) => ({
      ...t,
      precioEfectivo: Number(t.precioEfectivo),
      precioTransferencia: Number(t.precioTransferencia),
    })),
  }));
}

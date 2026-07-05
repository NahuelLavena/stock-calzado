import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUsuarioActual } from "@/lib/session";

const syncMovementActionSchema = z.enum(["create", "delete"]);

const movementDataSchema = z.object({
  id: z.string().uuid(),
  tipo: z.enum(["ENTRADA", "SALIDA", "AJUSTE_POS", "AJUSTE_NEG", "DEVOLUCION"]),
  cantidad: z.number().int().positive(),
  motivo: z.string().optional().nullable(),
  tallajeId: z.string().uuid(),
});

export async function POST(request: Request) {
  const usuario = await getUsuarioActual();
  if (!usuario) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const action = syncMovementActionSchema.parse(body.action);
    const data = movementDataSchema.parse(body.data);

    switch (action) {
      case "create": {
        const existing = await prisma.movimiento.findUnique({
          where: { id: data.id },
        });

        if (existing) {
          return NextResponse.json({
            success: true,
            message: "Movimiento ya existe",
          });
        }

        const result = await prisma.$transaction(async (tx) => {
          const tallaje = await tx.tallaje.findFirst({
            where: {
              id: data.tallajeId,
              producto: { empresaId: usuario.empresaId },
            },
          });

          if (!tallaje) {
            throw new Error("TALLE_NOT_FOUND");
          }

          if (data.tipo === "SALIDA" || data.tipo === "AJUSTE_NEG") {
            if (tallaje.stock < data.cantidad) {
              throw new Error(`STOCK_INSUFFICIENT:${tallaje.stock}`);
            }
          }

          let nuevoStock = tallaje.stock;
          switch (data.tipo) {
            case "ENTRADA":
            case "DEVOLUCION":
            case "AJUSTE_POS":
              nuevoStock += data.cantidad;
              break;
            case "SALIDA":
            case "AJUSTE_NEG":
              nuevoStock -= data.cantidad;
              break;
          }

          await tx.movimiento.create({
            data: {
              id: data.id,
              tipo: data.tipo,
              cantidad: data.cantidad,
              motivo: data.motivo ?? null,
              usuarioId: usuario.id,
              tallajeId: data.tallajeId,
            },
          });

          await tx.tallaje.update({
            where: { id: data.tallajeId },
            data: { stock: nuevoStock },
          });

          return { id: data.id };
        });

        return NextResponse.json({ success: true, id: result.id });
      }

      case "delete": {
        const movimiento = await prisma.movimiento.findFirst({
          where: {
            id: data.id,
            usuario: { empresaId: usuario.empresaId },
          },
          include: { tallaje: true },
        });

        if (!movimiento) {
          return NextResponse.json(
            { error: "Movimiento no encontrado" },
            { status: 404 }
          );
        }

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
          return NextResponse.json(
            { error: "No se puede eliminar: stock quedaría negativo" },
            { status: 400 }
          );
        }

        await prisma.$transaction([
          prisma.tallaje.update({
            where: { id: movimiento.tallajeId },
            data: { stock: nuevoStock },
          }),
          prisma.movimiento.delete({
            where: { id: data.id },
          }),
        ]);

        return NextResponse.json({ success: true });
      }
    }
  } catch (error) {
    console.error("Sync movements error:", error);
    if (error instanceof Error) {
      if (error.message === "TALLE_NOT_FOUND") {
        return NextResponse.json(
          { error: "Talle no encontrado" },
          { status: 404 }
        );
      }
      if (error.message.startsWith("STOCK_INSUFFICIENT:")) {
        const stock = error.message.split(":")[1];
        return NextResponse.json(
          { error: `Stock insuficiente. Stock actual: ${stock}` },
          { status: 400 }
        );
      }
    }
    return NextResponse.json(
      { error: "Error al sincronizar" },
      { status: 500 }
    );
  }

  return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
}

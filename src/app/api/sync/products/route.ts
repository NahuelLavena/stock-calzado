import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUsuarioActual } from "@/lib/session";

const syncActionSchema = z.enum(["create", "update", "delete"]);

const categorias = ["HOMBRES", "MUJER", "NINO", "NINA", "URBANAS", "BOTINES", "BEBE", "JUVENIL", "PANTUFLAS", "OJOTAS"] as const;

const productDataSchema = z.object({
  id: z.string().uuid(),
  sku: z.string().min(1),
  nombre: z.string().min(1),
  marca: z.string().min(1),
  modelo: z.string().min(1),
  descripcion: z.string().optional().nullable(),
  categoria: z.enum(categorias).optional(),
  precio: z.number().optional().nullable(),
  imagenUrl: z.string().optional().nullable(),
  activo: z.boolean(),
  tallas: z
    .array(
      z.object({
        id: z.string().uuid(),
        talla: z.string().min(1),
        color: z.string().min(1),
        stock: z.number().int().min(0),
        stockMinimo: z.number().int().min(0),
        precioEfectivo: z.number().min(0),
        precioTransferencia: z.number().min(0),
      })
    )
    .optional(),
});

export async function POST(request: Request) {
  const usuario = await getUsuarioActual();
  if (!usuario) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const action = syncActionSchema.parse(body.action);
    const data = productDataSchema.parse(body.data);

    switch (action) {
      case "create": {
        const existing = await prisma.producto.findFirst({
          where: { sku: data.sku, empresaId: usuario.empresaId },
        });

        if (existing) {
          return NextResponse.json({
            success: true,
            message: "Producto ya existe",
            existingId: existing.id,
          });
        }

        const producto = await prisma.producto.create({
          data: {
            id: data.id,
            sku: data.sku,
            nombre: data.nombre,
            marca: data.marca,
            modelo: data.modelo,
            descripcion: data.descripcion ?? null,
            ...(data.categoria ? { categoria: data.categoria } : {}),
            ...(data.precio != null ? { precio: data.precio } : {}),
            imagenUrl: data.imagenUrl ?? null,
            activo: data.activo,
            empresaId: usuario.empresaId,
          },
        });

        if (data.tallas && data.tallas.length > 0) {
          await prisma.$transaction(
            data.tallas.map((talla) =>
              prisma.tallaje.upsert({
                where: { id: talla.id },
                create: {
                  id: talla.id,
                  productoId: producto.id,
                  talla: talla.talla,
                  color: talla.color,
                  stock: talla.stock,
                  stockMinimo: talla.stockMinimo,
                  precioEfectivo: talla.precioEfectivo,
                  precioTransferencia: talla.precioTransferencia,
                },
                update: {
                  stock: talla.stock,
                  stockMinimo: talla.stockMinimo,
                  precioEfectivo: talla.precioEfectivo,
                  precioTransferencia: talla.precioTransferencia,
                },
              })
            )
          );
        }

        return NextResponse.json({ success: true, id: producto.id });
      }

      case "update": {
        await prisma.producto.update({
          where: { id: data.id, empresaId: usuario.empresaId },
          data: {
            sku: data.sku,
            nombre: data.nombre,
            marca: data.marca,
            modelo: data.modelo,
            descripcion: data.descripcion ?? null,
            ...(data.categoria ? { categoria: data.categoria } : {}),
            ...(data.precio != null ? { precio: data.precio } : {}),
            imagenUrl: data.imagenUrl ?? null,
            activo: data.activo,
          },
        });

        return NextResponse.json({ success: true });
      }

      case "delete": {
        await prisma.producto.delete({
          where: { id: data.id, empresaId: usuario.empresaId },
        });

        return NextResponse.json({ success: true });
      }
    }
  } catch (error) {
    console.error("Sync products error:", error);
    return NextResponse.json(
      { error: "Error al sincronizar" },
      { status: 500 }
    );
  }

  return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
}

import { z } from "zod";

export const crearTallajeSchema = z.object({
  productoId: z.string().uuid(),
  talla: z.string().min(1, "Talla requerida"),
  color: z.string().min(1, "Color requerido"),
  stock: z.coerce.number().int().min(0, "No puede ser negativo"),
  stockMinimo: z.coerce.number().int().min(0, "No puede ser negativo"),
  precioEfectivo: z.coerce.number().min(0, "No puede ser negativo"),
  precioTransferencia: z.coerce.number().min(0, "No puede ser negativo"),
});

export const actualizarTallajeSchema = z.object({
  id: z.string().uuid(),
  stock: z.coerce.number().int().min(0, "No puede ser negativo"),
  stockMinimo: z.coerce.number().int().min(0, "No puede ser negativo"),
  precioEfectivo: z.coerce.number().min(0, "No puede ser negativo").optional(),
  precioTransferencia: z.coerce.number().min(0, "No puede ser negativo").optional(),
});

export type CrearTallajeInput = z.infer<typeof crearTallajeSchema>;
export type ActualizarTallajeInput = z.infer<typeof actualizarTallajeSchema>;

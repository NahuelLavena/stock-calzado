import { z } from "zod";

const tiposMovimiento = ["ENTRADA", "SALIDA", "AJUSTE_POS", "AJUSTE_NEG", "DEVOLUCION"] as const;

export const crearMovimientoSchema = z.object({
  tipo: z.enum(tiposMovimiento),
  cantidad: z.coerce.number().int().positive("Debe ser mayor a 0"),
  motivo: z.string().max(500).optional(),
  tallajeId: z.string().uuid("Seleccioná un talle"),
});

export const editarMovimientoSchema = z.object({
  id: z.string().uuid(),
  tipo: z.enum(tiposMovimiento),
  cantidad: z.coerce.number().int().positive("Debe ser mayor a 0"),
  motivo: z.string().max(500).optional(),
  tallajeId: z.string().uuid("Seleccioná un talle"),
});

export type CrearMovimientoInput = z.infer<typeof crearMovimientoSchema>;
export type EditarMovimientoInput = z.infer<typeof editarMovimientoSchema>;

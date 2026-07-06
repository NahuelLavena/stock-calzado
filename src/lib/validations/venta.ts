import { z } from "zod";

const metodosPago = ["EFECTIVO", "TRANSFERENCIA", "TARJETA_DEBITO", "TARJETA_CREDITO", "OTRO"] as const;

export const crearVentaSchema = z.object({
  tallajeId: z.string().uuid("Seleccioná un talle"),
  clienteId: z.string().uuid().optional().or(z.literal("")).nullable(),
  clienteNombre: z.string().min(1, "Nombre del cliente requerido").optional().nullable(),
  metodoPago: z.enum(metodosPago),
  cantidad: z.coerce.number().int().positive("Debe ser mayor a 0"),
  motivo: z.string().optional(),
});

export type CrearVentaInput = z.infer<typeof crearVentaSchema>;

export const metodoPagoLabels: Record<string, string> = {
  EFECTIVO: "Efectivo",
  TRANSFERENCIA: "Transferencia",
  TARJETA_DEBITO: "Tarjeta Débito",
  TARJETA_CREDITO: "Tarjeta Crédito",
  OTRO: "Otro",
};

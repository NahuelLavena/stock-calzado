import { z } from "zod";

const roles = ["ADMIN", "VENDEDOR", "ALMACENERO"] as const;

export const crearUsuarioSchema = z.object({
  email: z.string().email("Email inválido"),
  nombre: z.string().min(2, "Mínimo 2 caracteres"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  rol: z.enum(roles),
  puedeEditarStock: z.boolean().default(false),
});

export const actualizarUsuarioSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string().min(2, "Mínimo 2 caracteres"),
  rol: z.enum(roles),
  puedeEditarStock: z.boolean().default(false),
});

export type CrearUsuarioInput = z.infer<typeof crearUsuarioSchema>;
export type ActualizarUsuarioInput = z.infer<typeof actualizarUsuarioSchema>;

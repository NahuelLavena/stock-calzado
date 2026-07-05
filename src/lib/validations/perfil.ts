import { z } from "zod";

export const actualizarPerfilSchema = z.object({
  nombre: z.string().min(2, "Mínimo 2 caracteres"),
});

export const cambiarContrasenaSchema = z.object({
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

export const actualizarEmpresaSchema = z.object({
  nombre: z.string().min(2, "Mínimo 2 caracteres"),
  logo: z.string().url("URL inválida").optional().or(z.literal("")),
});

export type ActualizarPerfilInput = z.infer<typeof actualizarPerfilSchema>;
export type CambiarContrasenaInput = z.infer<typeof cambiarContrasenaSchema>;
export type ActualizarEmpresaInput = z.infer<typeof actualizarEmpresaSchema>;

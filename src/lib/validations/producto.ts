import { z } from "zod";

const categorias = ["HOMBRES", "MUJER", "NINO", "NINA", "URBANAS", "BOTINES", "BEBE", "JUVENIL", "PANTUFLAS", "OJOTAS"] as const;

export const crearProductoSchema = z.object({
  sku: z.string().min(1, "SKU requerido"),
  nombre: z.string().min(1, "Nombre requerido"),
  marca: z.string().min(1, "Marca requerida"),
  modelo: z.string().min(1, "Modelo requerido"),
  descripcion: z.string().optional(),
  categoria: z.enum(categorias),
  precio: z.coerce.number().positive("Debe ser mayor a 0").optional(),
  precioCosto: z.coerce.number().min(0, "No puede ser negativo").optional(),
  imagenUrl: z.string().url("URL inválida").optional().or(z.literal("")),
});

export const actualizarProductoSchema = z.object({
  id: z.string().uuid(),
  sku: z.string().min(1, "SKU requerido"),
  nombre: z.string().min(1, "Nombre requerido"),
  marca: z.string().min(1, "Marca requerida"),
  modelo: z.string().min(1, "Modelo requerido"),
  descripcion: z.string().optional(),
  categoria: z.enum(categorias),
  precio: z.coerce.number().positive("Debe ser mayor a 0").optional(),
  precioCosto: z.coerce.number().min(0, "No puede ser negativo").optional(),
  imagenUrl: z.string().url("URL inválida").optional().or(z.literal("")),
});

export type CrearProductoInput = z.infer<typeof crearProductoSchema>;
export type ActualizarProductoInput = z.infer<typeof actualizarProductoSchema>;

import { z } from "zod";

const categorias = ["ZAPATILLAS", "BOTAS", "SANDALIAS", "ZAPATOS", "DEPORTIVOS", "OTROS"] as const;

export const crearProductoSchema = z.object({
  sku: z.string().min(1, "SKU requerido"),
  nombre: z.string().min(1, "Nombre requerido"),
  marca: z.string().min(1, "Marca requerida"),
  modelo: z.string().min(1, "Modelo requerido"),
  descripcion: z.string().optional(),
  categoria: z.enum(categorias),
  precio: z.coerce.number().positive("Debe ser mayor a 0"),
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
  precio: z.coerce.number().positive("Debe ser mayor a 0"),
  imagenUrl: z.string().url("URL inválida").optional().or(z.literal("")),
});

export type CrearProductoInput = z.infer<typeof crearProductoSchema>;
export type ActualizarProductoInput = z.infer<typeof actualizarProductoSchema>;

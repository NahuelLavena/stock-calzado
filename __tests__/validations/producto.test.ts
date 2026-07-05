import { describe, it, expect } from "vitest";
import { crearProductoSchema, actualizarProductoSchema } from "@/lib/validations/producto";

describe("crearProductoSchema", () => {
  const valid = {
    sku: "NIKE-001",
    nombre: "Air Max 90",
    marca: "Nike",
    modelo: "AM90",
    categoria: "HOMBRES",
    precio: 129.99,
  };

  it("rejects empty sku", () => {
    const result = crearProductoSchema.safeParse({ ...valid, sku: "" });
    expect(result.success).toBe(false);
  });

  it("rejects negative price", () => {
    const result = crearProductoSchema.safeParse({ ...valid, precio: -10 });
    expect(result.success).toBe(false);
  });

  it("rejects invalid categoria", () => {
    const result = crearProductoSchema.safeParse({ ...valid, categoria: "INVALID" });
    expect(result.success).toBe(false);
  });

  it("accepts valid data", () => {
    const result = crearProductoSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("accepts optional fields", () => {
    const result = crearProductoSchema.safeParse({
      ...valid,
      descripcion: "Zapatilla clásica",
      imagenUrl: "https://example.com/img.jpg",
    });
    expect(result.success).toBe(true);
  });
});

describe("actualizarProductoSchema", () => {
  it("requires valid uuid for id", () => {
    const result = actualizarProductoSchema.safeParse({
      id: "not-a-uuid",
      sku: "TEST",
      nombre: "Test",
      marca: "Test",
      modelo: "Test",
      categoria: "HOMBRES",
      precio: 10,
    });
    expect(result.success).toBe(false);
  });
});

import { describe, it, expect } from "vitest";
import { crearTallajeSchema, actualizarTallajeSchema } from "@/lib/validations/tallaje";

describe("crearTallajeSchema", () => {
  const valid = {
    productoId: "550e8400-e29b-41d4-a716-446655440000",
    talla: "42",
    color: "Negro",
    stock: 10,
    stockMinimo: 5,
    precioEfectivo: 100,
    precioTransferencia: 90,
  };

  it("rejects negative stock", () => {
    const result = crearTallajeSchema.safeParse({ ...valid, stock: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects empty talla", () => {
    const result = crearTallajeSchema.safeParse({ ...valid, talla: "" });
    expect(result.success).toBe(false);
  });

  it("accepts valid data", () => {
    const result = crearTallajeSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });
});

describe("actualizarTallajeSchema", () => {
  it("requires valid uuid", () => {
    const result = actualizarTallajeSchema.safeParse({ id: "bad", stock: 5, stockMinimo: 2 });
    expect(result.success).toBe(false);
  });

  it("accepts valid data", () => {
    const result = actualizarTallajeSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      stock: 5,
      stockMinimo: 2,
      precioEfectivo: 100,
      precioTransferencia: 90,
    });
    expect(result.success).toBe(true);
  });
});

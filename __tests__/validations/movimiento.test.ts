import { describe, it, expect } from "vitest";
import { crearMovimientoSchema } from "@/lib/validations/movimiento";

describe("crearMovimientoSchema", () => {
  const valid = {
    tipo: "ENTRADA" as const,
    cantidad: 10,
    tallajeId: "550e8400-e29b-41d4-a716-446655440000",
  };

  it("rejects zero cantidad", () => {
    const result = crearMovimientoSchema.safeParse({ ...valid, cantidad: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative cantidad", () => {
    const result = crearMovimientoSchema.safeParse({ ...valid, cantidad: -5 });
    expect(result.success).toBe(false);
  });

  it("rejects invalid tipo", () => {
    const result = crearMovimientoSchema.safeParse({ ...valid, tipo: "INVALID" });
    expect(result.success).toBe(false);
  });

  it("accepts all valid tipos", () => {
    for (const tipo of ["ENTRADA", "SALIDA", "AJUSTE_POS", "AJUSTE_NEG", "DEVOLUCION"]) {
      const result = crearMovimientoSchema.safeParse({ ...valid, tipo });
      expect(result.success).toBe(true);
    }
  });

  it("accepts optional motivo", () => {
    const result = crearMovimientoSchema.safeParse({ ...valid, motivo: "Reposición" });
    expect(result.success).toBe(true);
  });
});

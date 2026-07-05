import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema } from "@/lib/validations/auth";

describe("loginSchema", () => {
  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "123456" });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "123" });
    expect(result.success).toBe(false);
  });

  it("accepts valid data", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "123456" });
    expect(result.success).toBe(true);
  });
});

describe("registerSchema", () => {
  const valid = {
    email: "test@example.com",
    password: "123456",
    confirmPassword: "123456",
    nombre: "Juan",
    empresa: "Mi Empresa",
  };

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({ ...valid, confirmPassword: "654321" });
    expect(result.success).toBe(false);
  });

  it("rejects short nombre", () => {
    const result = registerSchema.safeParse({ ...valid, nombre: "J" });
    expect(result.success).toBe(false);
  });

  it("accepts valid data", () => {
    const result = registerSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });
});

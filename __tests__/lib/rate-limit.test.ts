import { describe, it, expect } from "vitest";
import { checkRateLimit, checkAuthRateLimit } from "@/lib/rate-limit";

describe("checkRateLimit", () => {
  it("allows first request", () => {
    const result = checkRateLimit("test-user-1");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBeGreaterThan(0);
  });

  it("blocks after max requests", () => {
    const key = "test-rate-limit-block";
    for (let i = 0; i < 30; i++) {
      checkRateLimit(key);
    }
    const result = checkRateLimit(key);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });
});

describe("checkAuthRateLimit", () => {
  it("allows first request", () => {
    const result = checkAuthRateLimit("auth-test-1");
    expect(result.allowed).toBe(true);
  });

  it("blocks after 5 attempts", () => {
    const key = "auth-block-test";
    for (let i = 0; i < 5; i++) {
      checkAuthRateLimit(key);
    }
    const result = checkAuthRateLimit(key);
    expect(result.allowed).toBe(false);
  });
});

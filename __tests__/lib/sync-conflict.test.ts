import { describe, it, expect } from "vitest";
import { resolveConflict, shouldPreferLocal, type SyncEntity } from "@/lib/sync/conflict";

function makeEntity(updatedAt: string, _synced = false): SyncEntity {
  return { updatedAt, _synced };
}

describe("resolveConflict", () => {
  it("returns local when local is newer", () => {
    const local = makeEntity("2026-07-04T12:00:00.000Z");
    const server = makeEntity("2026-07-04T11:00:00.000Z");

    const result = resolveConflict(local, server);
    expect(result.winner).toBe("local");
    expect(result.data).toBe(local);
  });

  it("returns server when server is newer", () => {
    const local = makeEntity("2026-07-04T11:00:00.000Z");
    const server = makeEntity("2026-07-04T12:00:00.000Z");

    const result = resolveConflict(local, server);
    expect(result.winner).toBe("server");
    expect(result.data).toBe(server);
  });

  it("returns server when timestamps are equal", () => {
    const local = makeEntity("2026-07-04T12:00:00.000Z");
    const server = makeEntity("2026-07-04T12:00:00.000Z");

    const result = resolveConflict(local, server);
    expect(result.winner).toBe("server");
    expect(result.data).toBe(server);
  });

  it("handles different date formats correctly", () => {
    const local = makeEntity("2026-07-04T14:30:00-03:00");
    const server = makeEntity("2026-07-04T18:00:00+00:00");

    const result = resolveConflict(local, server);
    expect(result.winner).toBe("server");
  });
});

describe("shouldPreferLocal", () => {
  it("returns true when server is null", () => {
    const local = makeEntity("2026-07-04T12:00:00.000Z");
    expect(shouldPreferLocal(local, null)).toBe(true);
  });

  it("returns true when local is newer", () => {
    const local = makeEntity("2026-07-04T12:00:00.000Z");
    const server = makeEntity("2026-07-04T11:00:00.000Z");
    expect(shouldPreferLocal(local, server)).toBe(true);
  });

  it("returns false when server is newer", () => {
    const local = makeEntity("2026-07-04T11:00:00.000Z");
    const server = makeEntity("2026-07-04T12:00:00.000Z");
    expect(shouldPreferLocal(local, server)).toBe(false);
  });

  it("returns false when timestamps are equal", () => {
    const local = makeEntity("2026-07-04T12:00:00.000Z");
    const server = makeEntity("2026-07-04T12:00:00.000Z");
    expect(shouldPreferLocal(local, server)).toBe(false);
  });
});

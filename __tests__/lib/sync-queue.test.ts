import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSyncQueue: Record<number, { id: number; entity: string; entityId: string; action: string; payload: unknown; timestamp: string; retryCount: number; status: string }> = {};
let nextId = 1;

vi.mock("@/lib/db", () => ({
  db: {
    syncQueue: {
      add: vi.fn(async (entry: Record<string, unknown>) => {
        const id = nextId++;
        const record = { id, retryCount: 0, status: "pending", ...entry };
        mockSyncQueue[id] = record as (typeof mockSyncQueue)[number];
        return id;
      }),
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          count: vi.fn(async () => Object.values(mockSyncQueue).filter((e) => e.status === "pending").length),
          sortBy: vi.fn(async () =>
            Object.values(mockSyncQueue)
              .filter((e) => e.status === "pending")
              .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
          ),
          toArray: vi.fn(async () =>
            Object.values(mockSyncQueue).filter((e) => e.status === "failed")
          ),
          delete: vi.fn(async () => {
            for (const key of Object.keys(mockSyncQueue)) {
              if (mockSyncQueue[Number(key)]?.status === "processing") {
                delete mockSyncQueue[Number(key)];
              }
            }
          }),
        })),
      })),
      get: vi.fn(async (id: number) => mockSyncQueue[id] || null),
      update: vi.fn(async (id: number, changes: Record<string, unknown>) => {
        if (mockSyncQueue[id]) {
          Object.assign(mockSyncQueue[id], changes);
        }
      }),
      delete: vi.fn(async (id: number) => {
        delete mockSyncQueue[id];
      }),
    },
    productos: { update: vi.fn() },
    tallas: { update: vi.fn() },
    movimientos: { update: vi.fn() },
  },
}));

import { enqueue, getPending, getPendingCount, markProcessing, markProcessed, markFailed, getAllFailed } from "@/lib/sync/queue";

beforeEach(() => {
  for (const key of Object.keys(mockSyncQueue)) {
    delete mockSyncQueue[Number(key)];
  }
  nextId = 1;
});

describe("enqueue", () => {
  it("adds entry with default retryCount and status", async () => {
    const id = await enqueue({
      entity: "producto",
      entityId: "p1",
      action: "create",
      payload: { nombre: "Test" },
      timestamp: "2026-07-04T12:00:00Z",
    });

    expect(id).toBe(1);
    expect(mockSyncQueue[1]).toMatchObject({
      entity: "producto",
      entityId: "p1",
      action: "create",
      retryCount: 0,
      status: "pending",
    });
  });

  it("increments id for each entry", async () => {
    const id1 = await enqueue({
      entity: "producto",
      entityId: "p1",
      action: "create",
      payload: {},
      timestamp: "2026-07-04T12:00:00Z",
    });
    const id2 = await enqueue({
      entity: "movimiento",
      entityId: "m1",
      action: "create",
      payload: {},
      timestamp: "2026-07-04T12:01:00Z",
    });

    expect(id2).toBe(id1 + 1);
  });
});

describe("getPending", () => {
  it("returns pending entries sorted by timestamp", async () => {
    await enqueue({ entity: "producto", entityId: "p1", action: "create", payload: {}, timestamp: "2026-07-04T12:02:00Z" });
    await enqueue({ entity: "producto", entityId: "p2", action: "create", payload: {}, timestamp: "2026-07-04T12:00:00Z" });
    await enqueue({ entity: "producto", entityId: "p3", action: "create", payload: {}, timestamp: "2026-07-04T12:01:00Z" });

    const pending = await getPending();
    expect(pending).toHaveLength(3);
    expect(pending[0].timestamp).toBe("2026-07-04T12:00:00Z");
    expect(pending[1].timestamp).toBe("2026-07-04T12:01:00Z");
    expect(pending[2].timestamp).toBe("2026-07-04T12:02:00Z");
  });

  it("returns empty array when no pending entries", async () => {
    const pending = await getPending();
    expect(pending).toHaveLength(0);
  });
});

describe("getPendingCount", () => {
  it("counts only pending entries", async () => {
    await enqueue({ entity: "producto", entityId: "p1", action: "create", payload: {}, timestamp: "2026-07-04T12:00:00Z" });
    await enqueue({ entity: "producto", entityId: "p2", action: "create", payload: {}, timestamp: "2026-07-04T12:01:00Z" });

    const count = await getPendingCount();
    expect(count).toBe(2);
  });
});

describe("markProcessing", () => {
  it("updates status to processing", async () => {
    const id = await enqueue({ entity: "producto", entityId: "p1", action: "create", payload: {}, timestamp: "2026-07-04T12:00:00Z" });

    await markProcessing(id);
    expect(mockSyncQueue[id].status).toBe("processing");
  });
});

describe("markProcessed", () => {
  it("deletes the entry", async () => {
    const id = await enqueue({ entity: "producto", entityId: "p1", action: "create", payload: {}, timestamp: "2026-07-04T12:00:00Z" });

    await markProcessed(id);
    expect(mockSyncQueue[id]).toBeUndefined();
  });
});

describe("markFailed", () => {
  it("increments retryCount and keeps status pending when retryCount < 3", async () => {
    const id = await enqueue({ entity: "producto", entityId: "p1", action: "create", payload: {}, timestamp: "2026-07-04T12:00:00Z" });

    await markFailed(id);
    expect(mockSyncQueue[id].retryCount).toBe(1);
    expect(mockSyncQueue[id].status).toBe("pending");
  });

  it("sets status to failed when retryCount >= 3", async () => {
    const id = await enqueue({ entity: "producto", entityId: "p1", action: "create", payload: {}, timestamp: "2026-07-04T12:00:00Z" });
    mockSyncQueue[id].retryCount = 3;

    await markFailed(id);
    expect(mockSyncQueue[id].status).toBe("failed");
    expect(mockSyncQueue[id].retryCount).toBe(3);
  });

  it("does nothing when entry does not exist", async () => {
    await markFailed(999);
    // Should not throw
  });
});

describe("getAllFailed", () => {
  it("returns only failed entries", async () => {
    const id1 = await enqueue({ entity: "producto", entityId: "p1", action: "create", payload: {}, timestamp: "2026-07-04T12:00:00Z" });
    const id2 = await enqueue({ entity: "producto", entityId: "p2", action: "create", payload: {}, timestamp: "2026-07-04T12:01:00Z" });

    mockSyncQueue[id1].status = "failed";
    mockSyncQueue[id2].status = "pending";

    const failed = await getAllFailed();
    expect(failed).toHaveLength(1);
    expect(failed[0].entityId).toBe("p1");
  });
});

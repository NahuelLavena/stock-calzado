import { describe, it, expect, vi, beforeEach } from "vitest";

const mockData = {
  productos: [] as Record<string, unknown>[],
  tallas: [] as Record<string, unknown>[],
  movimientos: [] as Record<string, unknown>[],
};

vi.mock("@/lib/db", () => ({
  db: {
    productos: {
      clear: vi.fn(async () => { mockData.productos = []; }),
      bulkAdd: vi.fn(async (items: Record<string, unknown>[]) => { mockData.productos.push(...items); }),
      add: vi.fn(async (item: Record<string, unknown>) => { mockData.productos.push(item); }),
      get: vi.fn(async (id: string) => mockData.productos.find((p) => p.id === id) || null),
      update: vi.fn(async (id: string, changes: Record<string, unknown>) => {
        const idx = mockData.productos.findIndex((p) => p.id === id);
        if (idx !== -1) Object.assign(mockData.productos[idx], changes);
      }),
      delete: vi.fn(async (id: string) => {
        mockData.productos = mockData.productos.filter((p) => p.id !== id);
      }),
      toArray: vi.fn(async () => mockData.productos),
    },
    tallas: {
      clear: vi.fn(async () => { mockData.tallas = []; }),
      bulkAdd: vi.fn(async (items: Record<string, unknown>[]) => { mockData.tallas.push(...items); }),
      add: vi.fn(async (item: Record<string, unknown>) => { mockData.tallas.push(item); }),
      get: vi.fn(async (id: string) => mockData.tallas.find((t) => t.id === id) || null),
      update: vi.fn(async (id: string, changes: Record<string, unknown>) => {
        const idx = mockData.tallas.findIndex((t) => t.id === id);
        if (idx !== -1) Object.assign(mockData.tallas[idx], changes);
      }),
      where: vi.fn((field: string) => ({
        equals: vi.fn((value: string) => ({
          delete: vi.fn(async () => {
            if (field === "productoId") {
              mockData.tallas = mockData.tallas.filter((t) => t.productoId !== value);
            }
          }),
          toArray: vi.fn(async () => {
            if (field === "productoId") {
              return mockData.tallas.filter((t) => t.productoId === value);
            }
            return [];
          }),
        })),
      })),
    },
    movimientos: {
      clear: vi.fn(async () => { mockData.movimientos = []; }),
      bulkAdd: vi.fn(async (items: Record<string, unknown>[]) => { mockData.movimientos.push(...items); }),
      add: vi.fn(async (item: Record<string, unknown>) => { mockData.movimientos.push(item); }),
      get: vi.fn(async (id: string) => mockData.movimientos.find((m) => m.id === id) || null),
      update: vi.fn(async (id: string, changes: Record<string, unknown>) => {
        const idx = mockData.movimientos.findIndex((m) => m.id === id);
        if (idx !== -1) Object.assign(mockData.movimientos[idx], changes);
      }),
      delete: vi.fn(async (id: string) => {
        mockData.movimientos = mockData.movimientos.filter((m) => m.id !== id);
      }),
      toArray: vi.fn(async () => mockData.movimientos),
    },
    transaction: vi.fn(async (_mode: string, _tables: unknown[], fn: () => Promise<void>) => {
      await fn();
    }),
  },
}));

import { seedFromServer, upsertProducto, upsertTallaje, upsertMovimiento, deleteProducto, deleteMovimiento, getAllProductos, getProductoById, getTallasByProducto, getAllMovimientos } from "@/lib/sync/seed";

beforeEach(() => {
  mockData.productos = [];
  mockData.tallas = [];
  mockData.movimientos = [];
  vi.clearAllMocks();
});

const sampleProductos = [
  { id: "p1", empresaId: "e1", sku: "SKU001", nombre: "Zapatilla A", marca: "Nike", modelo: "Air", descripcion: null, categoria: "ZAPATILLAS", precio: 100, imagenUrl: null, activo: true, createdAt: "2026-07-04T12:00:00Z", updatedAt: "2026-07-04T12:00:00Z", _synced: false },
];

const sampleTallas = [
  { id: "t1", productoId: "p1", talla: "40", color: "Negro", stock: 10, stockMinimo: 3, _synced: false },
];

const sampleMovimientos = [
  { id: "m1", empresaId: "e1", tipo: "ENTRADA", cantidad: 10, motivo: "Compra", usuarioId: "u1", tallajeId: "t1", createdAt: "2026-07-04T12:00:00Z", _synced: false },
];

describe("seedFromServer", () => {
  it("clears existing data and inserts new data", async () => {
    mockData.productos = [{ id: "old", _synced: true }];
    mockData.tallas = [{ id: "old-t", _synced: true }];
    mockData.movimientos = [{ id: "old-m", _synced: true }];

    await seedFromServer(sampleProductos, sampleTallas, sampleMovimientos);

    expect(mockData.productos).toHaveLength(1);
    expect(mockData.productos[0].id).toBe("p1");
    expect(mockData.productos[0]._synced).toBe(true);
  });

  it("marks all synced entities as _synced: true", async () => {
    await seedFromServer(sampleProductos, sampleTallas, sampleMovimientos);

    expect(mockData.productos[0]._synced).toBe(true);
    expect(mockData.tallas[0]._synced).toBe(true);
    expect(mockData.movimientos[0]._synced).toBe(true);
  });
});

describe("upsertProducto", () => {
  it("adds new product when it does not exist", async () => {
    await upsertProducto(sampleProductos[0]);
    expect(mockData.productos).toHaveLength(1);
    expect(mockData.productos[0].id).toBe("p1");
  });

  it("updates existing product", async () => {
    mockData.productos = [{ ...sampleProductos[0], nombre: "Old Name" }];
    await upsertProducto({ ...sampleProductos[0], nombre: "New Name" });
    expect(mockData.productos).toHaveLength(1);
    expect(mockData.productos[0].nombre).toBe("New Name");
  });
});

describe("upsertTallaje", () => {
  it("adds new tallaje when it does not exist", async () => {
    await upsertTallaje(sampleTallas[0]);
    expect(mockData.tallas).toHaveLength(1);
  });

  it("updates existing tallaje", async () => {
    mockData.tallas = [{ ...sampleTallas[0], stock: 5 }];
    await upsertTallaje({ ...sampleTallas[0], stock: 20 });
    expect(mockData.tallas).toHaveLength(1);
    expect(mockData.tallas[0].stock).toBe(20);
  });
});

describe("upsertMovimiento", () => {
  it("adds new movimiento when it does not exist", async () => {
    await upsertMovimiento(sampleMovimientos[0]);
    expect(mockData.movimientos).toHaveLength(1);
  });

  it("updates existing movimiento", async () => {
    mockData.movimientos = [{ ...sampleMovimientos[0], cantidad: 5 }];
    await upsertMovimiento({ ...sampleMovimientos[0], cantidad: 15 });
    expect(mockData.movimientos).toHaveLength(1);
    expect(mockData.movimientos[0].cantidad).toBe(15);
  });
});

describe("deleteProducto", () => {
  it("removes product and its tallas", async () => {
    mockData.productos = [{ id: "p1" }];
    mockData.tallas = [{ id: "t1", productoId: "p1" }, { id: "t2", productoId: "p2" }];

    await deleteProducto("p1");
    expect(mockData.productos).toHaveLength(0);
  });
});

describe("deleteMovimiento", () => {
  it("removes the movement", async () => {
    mockData.movimientos = [{ id: "m1" }, { id: "m2" }];
    await deleteMovimiento("m1");
    expect(mockData.movimientos).toHaveLength(1);
    expect(mockData.movimientos[0].id).toBe("m2");
  });
});

describe("getAllProductos", () => {
  it("returns all products", async () => {
    mockData.productos = [...sampleProductos];
    const result = await getAllProductos();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("p1");
  });
});

describe("getProductoById", () => {
  it("returns product by id", async () => {
    mockData.productos = [...sampleProductos];
    const result = await getProductoById("p1");
    expect(result).toBeDefined();
    expect(result?.nombre).toBe("Zapatilla A");
  });

  it("returns undefined for non-existent product", async () => {
    const result = await getProductoById("nonexistent");
    expect(result).toBeNull();
  });
});

describe("getTallasByProducto", () => {
  it("returns tallas for a product", async () => {
    mockData.tallas = [...sampleTallas];
    const result = await getTallasByProducto("p1");
    expect(result).toHaveLength(1);
  });
});

describe("getAllMovimientos", () => {
  it("returns all movements", async () => {
    mockData.movimientos = [...sampleMovimientos];
    const result = await getAllMovimientos();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("m1");
  });
});

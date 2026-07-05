import { db, type OfflineProducto, type OfflineTallaje, type OfflineMovimiento } from "@/lib/db";

export async function seedFromServer(
  productos: OfflineProducto[],
  tallas: OfflineTallaje[],
  movimientos: OfflineMovimiento[]
) {
  await db.transaction("rw", [db.productos, db.tallas, db.movimientos], async () => {
    await db.productos.clear();
    await db.tallas.clear();
    await db.movimientos.clear();

    await db.productos.bulkAdd(productos.map((p) => ({ ...p, _synced: true })));
    await db.tallas.bulkAdd(tallas.map((t) => ({ ...t, _synced: true })));
    await db.movimientos.bulkAdd(movimientos.map((m) => ({ ...m, _synced: true })));
  });
}

export async function upsertProducto(producto: OfflineProducto) {
  const existing = await db.productos.get(producto.id);
  if (existing) {
    await db.productos.update(producto.id, producto);
  } else {
    await db.productos.add(producto);
  }
}

export async function upsertTallaje(tallaje: OfflineTallaje) {
  const existing = await db.tallas.get(tallaje.id);
  if (existing) {
    await db.tallas.update(tallaje.id, tallaje);
  } else {
    await db.tallas.add(tallaje);
  }
}

export async function upsertMovimiento(movimiento: OfflineMovimiento) {
  const existing = await db.movimientos.get(movimiento.id);
  if (existing) {
    await db.movimientos.update(movimiento.id, movimiento);
  } else {
    await db.movimientos.add(movimiento);
  }
}

export async function deleteProducto(id: string) {
  await db.productos.delete(id);
  await db.tallas.where("productoId").equals(id).delete();
}

export async function deleteMovimiento(id: string) {
  await db.movimientos.delete(id);
}

export async function getAllProductos() {
  return db.productos.toArray();
}

export async function getProductoById(id: string) {
  return db.productos.get(id);
}

export async function getTallasByProducto(productoId: string) {
  return db.tallas.where("productoId").equals(productoId).toArray();
}

export async function getAllMovimientos() {
  return db.movimientos.toArray();
}

export async function getMovimientoById(id: string) {
  return db.movimientos.get(id);
}

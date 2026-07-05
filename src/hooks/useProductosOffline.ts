"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db, type OfflineProducto, type OfflineTallaje } from "@/lib/db";
import { enqueue } from "@/lib/sync/queue";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export function useProductosOffline() {
  const isOnline = useOnlineStatus();

  const productos = useLiveQuery(async () => {
    const allProductos = await db.productos.toArray();
    const allTallas = await db.tallas.toArray();

    const tallasByProducto = new Map<string, OfflineTallaje[]>();
    for (const t of allTallas) {
      const list = tallasByProducto.get(t.productoId);
      if (list) {
        list.push(t);
      } else {
        tallasByProducto.set(t.productoId, [t]);
      }
    }

    return allProductos.map((p) => ({
      ...p,
      tallas: tallasByProducto.get(p.id) ?? [],
    }));
  }, [], [] as (OfflineProducto & { tallas: OfflineTallaje[] })[]);

  const createProducto = async (producto: OfflineProducto) => {
    await db.productos.add({ ...producto, _synced: false });
    await enqueue({
      entity: "producto",
      entityId: producto.id,
      action: "create",
      payload: producto,
      timestamp: new Date().toISOString(),
    });
  };

  const updateProducto = async (id: string, updates: Partial<OfflineProducto>) => {
    await db.productos.update(id, { ...updates, _synced: false });
    const producto = await db.productos.get(id);
    if (producto) {
      await enqueue({
        entity: "producto",
        entityId: id,
        action: "update",
        payload: producto,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const deleteProducto = async (id: string) => {
    await db.productos.delete(id);
    await db.tallas.where("productoId").equals(id).delete();
    await enqueue({
      entity: "producto",
      entityId: id,
      action: "delete",
      payload: { id },
      timestamp: new Date().toISOString(),
    });
  };

  return {
    productos: productos ?? [],
    loading: productos === undefined,
    isOnline,
    createProducto,
    updateProducto,
    deleteProducto,
  };
}

"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db, type OfflineMovimiento } from "@/lib/db";
import { enqueue } from "@/lib/sync/queue";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export function useMovimientosOffline() {
  const isOnline = useOnlineStatus();

  const movimientos = useLiveQuery(async () => {
    const all = await db.movimientos.toArray();
    return all.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [], [] as OfflineMovimiento[]);

  const createMovimiento = async (movimiento: OfflineMovimiento) => {
    const tallaje = await db.tallas.get(movimiento.tallajeId);
    if (tallaje) {
      let nuevoStock = tallaje.stock;
      switch (movimiento.tipo) {
        case "ENTRADA":
        case "DEVOLUCION":
        case "AJUSTE_POS":
          nuevoStock += movimiento.cantidad;
          break;
        case "SALIDA":
        case "AJUSTE_NEG":
          nuevoStock -= movimiento.cantidad;
          break;
      }
      if (nuevoStock < 0) {
        throw new Error(`Stock insuficiente. Stock actual: ${tallaje.stock}`);
      }
      await db.tallas.update(movimiento.tallajeId, { stock: nuevoStock });
    }

    await db.movimientos.add({ ...movimiento, _synced: false });
    await enqueue({
      entity: "movimiento",
      entityId: movimiento.id,
      action: "create",
      payload: movimiento,
      timestamp: new Date().toISOString(),
    });
  };

  const deleteMovimiento = async (id: string) => {
    const movimiento = await db.movimientos.get(id);
    if (movimiento) {
      const tallaje = await db.tallas.get(movimiento.tallajeId);
      if (tallaje) {
        let nuevoStock = tallaje.stock;
        switch (movimiento.tipo) {
          case "ENTRADA":
          case "DEVOLUCION":
          case "AJUSTE_POS":
            nuevoStock -= movimiento.cantidad;
            break;
          case "SALIDA":
          case "AJUSTE_NEG":
            nuevoStock += movimiento.cantidad;
            break;
        }
        if (nuevoStock < 0) {
          throw new Error("No se puede eliminar: stock quedaría negativo");
        }
        await db.tallas.update(movimiento.tallajeId, { stock: nuevoStock });
      }
    }

    await db.movimientos.delete(id);
    await enqueue({
      entity: "movimiento",
      entityId: id,
      action: "delete",
      payload: { id },
      timestamp: new Date().toISOString(),
    });
  };

  return {
    movimientos: movimientos ?? [],
    loading: movimientos === undefined,
    isOnline,
    createMovimiento,
    deleteMovimiento,
  };
}

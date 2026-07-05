import { db } from "@/lib/db";
import { getPending, markProcessing, markProcessed, markFailed } from "@/lib/sync/queue";

let syncInterval: ReturnType<typeof setInterval> | null = null;
let onlineHandler: (() => void) | null = null;

export async function processSyncQueue(): Promise<boolean> {
  if (!navigator.onLine) return false;

  const pending = await getPending();
  if (pending.length === 0) return false;

  let allSuccess = true;

  for (const entry of pending) {
    if (!entry.id) continue;

    try {
      await markProcessing(entry.id);

      const response = await fetch(`/api/sync/${entry.entity === "movimiento" ? "movements" : "products"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: entry.action,
          data: entry.payload,
        }),
      });

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`);
      }

      await markProcessed(entry.id);

      if (entry.entity === "producto" && entry.action !== "delete") {
        await db.productos.update(entry.entityId, { _synced: true });
      } else if (entry.entity === "tallaje" && entry.action !== "delete") {
        await db.tallas.update(entry.entityId, { _synced: true });
      } else if (entry.entity === "movimiento" && entry.action !== "delete") {
        await db.movimientos.update(entry.entityId, { _synced: true });
      }
    } catch {
      await markFailed(entry.id);
      allSuccess = false;
    }
  }

  return allSuccess;
}

export function startSyncWorker() {
  if (syncInterval) return;

  onlineHandler = () => {
    processSyncQueue();
  };
  window.addEventListener("online", onlineHandler);

  syncInterval = setInterval(() => {
    if (navigator.onLine) {
      processSyncQueue();
    }
  }, 30000);
}

export function stopSyncWorker() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
  if (onlineHandler) {
    window.removeEventListener("online", onlineHandler);
    onlineHandler = null;
  }
}

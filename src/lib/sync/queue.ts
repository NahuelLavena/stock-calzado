import { db, type SyncQueueEntry } from "@/lib/db";

export async function enqueue(entry: Omit<SyncQueueEntry, "id" | "retryCount" | "status">) {
  return db.syncQueue.add({
    ...entry,
    retryCount: 0,
    status: "pending",
  });
}

export async function getPending(): Promise<SyncQueueEntry[]> {
  return db.syncQueue
    .where("status")
    .equals("pending")
    .sortBy("timestamp");
}

export async function getPendingCount(): Promise<number> {
  return db.syncQueue.where("status").equals("pending").count();
}

export async function markProcessing(id: number) {
  return db.syncQueue.update(id, { status: "processing" });
}

export async function markProcessed(id: number) {
  return db.syncQueue.delete(id);
}

export async function markFailed(id: number) {
  const entry = await db.syncQueue.get(id);
  if (!entry) return;

  if (entry.retryCount >= 3) {
    await db.syncQueue.update(id, { status: "failed" });
  } else {
    await db.syncQueue.update(id, {
      status: "pending",
      retryCount: entry.retryCount + 1,
    });
  }
}

export async function clearProcessed() {
  return db.syncQueue.where("status").equals("processing").delete();
}

export async function getAllFailed(): Promise<SyncQueueEntry[]> {
  return db.syncQueue.where("status").equals("failed").toArray();
}

export interface SyncEntity {
  updatedAt: string;
  _synced: boolean;
}

export function resolveConflict<T extends SyncEntity>(
  local: T,
  server: T
): { winner: "local" | "server"; data: T } {
  const localTime = new Date(local.updatedAt).getTime();
  const serverTime = new Date(server.updatedAt).getTime();

  if (localTime > serverTime) {
    return { winner: "local", data: local };
  }

  return { winner: "server", data: server };
}

export function shouldPreferLocal(local: SyncEntity, server: SyncEntity | null): boolean {
  if (!server) return true;

  const localTime = new Date(local.updatedAt).getTime();
  const serverTime = new Date(server.updatedAt).getTime();

  return localTime > serverTime;
}

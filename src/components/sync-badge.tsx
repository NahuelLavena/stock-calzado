"use client";

import { useSyncQueue } from "@/hooks/useSyncQueue";

export function SyncBadge() {
  const pendingCount = useSyncQueue();

  if (pendingCount === 0) return null;

  return (
    <div className="flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
      {pendingCount} pendiente{pendingCount !== 1 ? "s" : ""}
    </div>
  );
}

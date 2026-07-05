"use client";

import { OfflineBanner } from "@/components/offline-banner";
import { SyncBadge } from "@/components/sync-badge";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { startSyncWorker } from "@/lib/sync/worker";
import { useEffect } from "react";

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const isOnline = useOnlineStatus();

  useEffect(() => {
    startSyncWorker();
  }, []);

  return (
    <>
      <OfflineBanner />
      <div className={isOnline ? "" : "pt-10"}>
        {children}
      </div>
    </>
  );
}

export function HeaderSyncBadge() {
  return <SyncBadge />;
}

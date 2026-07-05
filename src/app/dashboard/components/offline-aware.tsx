"use client";

import { useOnlineStatus } from "@/hooks/useOnlineStatus";

interface OfflineAwareProps {
  onlineContent: React.ReactNode;
  offlineContent: React.ReactNode;
}

export function OfflineAware({ onlineContent, offlineContent }: OfflineAwareProps) {
  const isOnline = useOnlineStatus();

  return <>{isOnline ? onlineContent : offlineContent}</>;
}

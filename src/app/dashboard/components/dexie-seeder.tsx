"use client";

import { useEffect, useRef } from "react";
import { seedFromServer } from "@/lib/sync/seed";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export function DexieSeeder() {
  const isOnline = useOnlineStatus();
  const hasSeeded = useRef(false);

  useEffect(() => {
    if (!isOnline || hasSeeded.current) return;

    async function syncData() {
      try {
        const res = await fetch("/api/sync/seed");
        if (!res.ok) return;

        const data = await res.json();
        await seedFromServer(data.productos, data.tallas, data.movimientos);
        hasSeeded.current = true;
      } catch {
        // Silently fail - offline or network error
      }
    }

    syncData();
  }, [isOnline]);

  return null;
}

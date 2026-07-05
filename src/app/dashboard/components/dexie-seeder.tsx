"use client";

import { useEffect, useRef } from "react";
import { seedFromServer } from "@/lib/sync/seed";
import { db } from "@/lib/db";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

interface DexieSeederProps {
  empresaId: string;
  usuarioId: string;
}

export function DexieSeeder({ empresaId, usuarioId }: DexieSeederProps) {
  const isOnline = useOnlineStatus();
  const hasSeeded = useRef(false);
  const lastSeedTime = useRef(0);

  useEffect(() => {
    if (empresaId && usuarioId) {
      localStorage.setItem("sc_empresaId", empresaId);
      localStorage.setItem("sc_usuarioId", usuarioId);
    }
  }, [empresaId, usuarioId]);

  useEffect(() => {
    if (!isOnline) return;

    async function syncData() {
      try {
        const res = await fetch("/api/sync/seed");
        if (!res.ok) return;

        const data = await res.json();
        await seedFromServer(data.productos, data.tallas, data.movimientos);
        hasSeeded.current = true;
        lastSeedTime.current = Date.now();
      } catch {
        // Offline or network error — will retry on next online event
      }
    }

    const shouldReseed =
      !hasSeeded.current || Date.now() - lastSeedTime.current > 300000;

    if (shouldReseed) {
      syncData();
    }
  }, [isOnline]);

  useEffect(() => {
    if (!isOnline) return;

    async function checkAndReseed() {
      const count = await db.productos.count();
      if (count === 0) {
        hasSeeded.current = false;
        lastSeedTime.current = 0;

        try {
          const res = await fetch("/api/sync/seed");
          if (!res.ok) return;

          const data = await res.json();
          await seedFromServer(data.productos, data.tallas, data.movimientos);
          hasSeeded.current = true;
          lastSeedTime.current = Date.now();
        } catch {
          // Will retry
        }
      }
    }

    checkAndReseed();
  }, [isOnline]);

  return null;
}

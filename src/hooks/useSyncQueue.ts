"use client";

import { useState, useEffect } from "react";
import { getPendingCount } from "@/lib/sync/queue";

export function useSyncQueue() {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const updateCount = async () => {
      const count = await getPendingCount();
      setPendingCount(count);
    };

    updateCount();

    const interval = setInterval(updateCount, 5000);

    window.addEventListener("online", updateCount);

    return () => {
      clearInterval(interval);
      window.removeEventListener("online", updateCount);
    };
  }, []);

  return pendingCount;
}

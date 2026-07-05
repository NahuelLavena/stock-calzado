"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-semibold text-gray-900">
        Algo salió mal
      </h2>
      <p className="text-sm text-gray-500">{error.message}</p>
      <Button onClick={reset} variant="secondary">
        Intentar de nuevo
      </Button>
    </div>
  );
}

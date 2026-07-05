"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleActivoProducto } from "../actions";
import { Button } from "@/components/ui/button";

export function ToggleActivoButton({
  productoId,
  activo,
}: {
  productoId: string;
  activo: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleClick = async () => {
    const result = await toggleActivoProducto(productoId);
    if (!result.error) {
      router.refresh();
    }
  };

  return (
    <Button
      variant={activo ? "danger" : "secondary"}
      size="sm"
      loading={pending}
      onClick={() => startTransition(handleClick)}
    >
      {activo ? "Desactivar" : "Activar"}
    </Button>
  );
}

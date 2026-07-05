"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { eliminarMovimiento } from "./actions";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function MovimientoRowActions({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete() {
    setLoading(true);
    setError(null);
    const result = await eliminarMovimiento(id);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    router.refresh();
  }

  return (
    <>
      <div className="flex gap-1">
        <Link href={`/dashboard/movimientos/${id}/editar`}>
          <Button variant="ghost" size="sm">
            Editar
          </Button>
        </Link>
        <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
          Eliminar
        </Button>
      </div>

      <ConfirmDialog
        open={open}
        onClose={() => {
          setOpen(false);
          setError(null);
        }}
        onConfirm={handleDelete}
        title="Eliminar movimiento"
        message={
          error
            ? error
            : "¿Estás seguro de que querés eliminar este movimiento? El stock se revertirá automáticamente."
        }
        confirmLabel="Eliminar"
        loading={loading}
        variant={error ? "primary" : "danger"}
      />
    </>
  );
}

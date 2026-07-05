"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { crearTallaje, actualizarTallaje, eliminarTallaje } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

interface TallajeData {
  id: string;
  talla: string;
  color: string;
  stock: number;
  stockMinimo: number;
  precioEfectivo: number;
  precioTransferencia: number;
}

interface TallajeManagerProps {
  productoId: string;
  mode: "create" | "edit";
  tallaje?: TallajeData;
}

export function TallajeManager({
  productoId,
  mode,
  tallaje,
}: TallajeManagerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleCreate = async (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await crearTallaje(null, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setOpen(false);
        router.refresh();
      }
    });
  };

  const handleEdit = async (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await actualizarTallaje(null, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setOpen(false);
        router.refresh();
      }
    });
  };

  const handleDelete = async () => {
    if (!tallaje) return;
    startTransition(async () => {
      const result = await eliminarTallaje(tallaje.id);
      if (!result.error) {
        setOpen(false);
        router.refresh();
      }
    });
  };

  return (
    <>
      {mode === "create" ? (
        <Button size="sm" onClick={() => setOpen(true)}>
          + Agregar Talle
        </Button>
      ) : (
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setOpen(true)}
          >
            Editar
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-rose-600 hover:text-rose-700"
            onClick={() => {
              setOpen(true);
            }}
          >
            Eliminar
          </Button>
        </div>
      )}

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setError(null);
        }}
        title={mode === "create" ? "Agregar Talle" : `Editar: ${tallaje?.talla} - ${tallaje?.color}`}
        size="sm"
      >
        {mode === "create" ? (
          <form action={handleCreate} className="space-y-4">
            <input type="hidden" name="productoId" value={productoId} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input label="Talla" name="talla" placeholder="40" required />
              <Input label="Color" name="color" placeholder="Negro" required />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                label="Stock"
                name="stock"
                type="number"
                min="0"
                defaultValue="0"
              />
              <Input
                label="Stock Mínimo"
                name="stockMinimo"
                type="number"
                min="0"
                defaultValue="5"
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                label="Precio Efectivo"
                name="precioEfectivo"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                required
              />
              <Input
                label="Precio Transferencia"
                name="precioTransferencia"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                required
              />
            </div>
            {error && (
              <p className="text-sm text-rose-600">{error}</p>
            )}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" loading={pending}>
                Agregar
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <form action={handleEdit} className="space-y-4">
              <input type="hidden" name="id" value={tallaje?.id} />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input
                  label="Stock"
                  name="stock"
                  type="number"
                  min="0"
                  defaultValue={tallaje?.stock}
                />
                <Input
                  label="Stock Mínimo"
                  name="stockMinimo"
                  type="number"
                  min="0"
                  defaultValue={tallaje?.stockMinimo}
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input
                  label="Precio Efectivo"
                  name="precioEfectivo"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={tallaje?.precioEfectivo}
                />
                <Input
                  label="Precio Transferencia"
                  name="precioTransferencia"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={tallaje?.precioTransferencia}
                />
              </div>
              {error && (
                <p className="text-sm text-rose-600">{error}</p>
              )}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" loading={pending}>
                  Guardar
                </Button>
              </div>
            </form>

            <div className="border-t border-slate-200 pt-4">
              <p className="mb-2 text-sm text-slate-500">
                ¿Eliminar este talle? Se perderán todos los datos asociados.
              </p>
              <Button
                variant="danger"
                size="sm"
                loading={pending}
                onClick={handleDelete}
              >
                Eliminar talle
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

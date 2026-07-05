"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { actualizarProducto } from "../../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

const categorias = [
  { value: "ZAPATILLAS", label: "Zapatillas" },
  { value: "BOTAS", label: "Botas" },
  { value: "SANDALIAS", label: "Sandalias" },
  { value: "ZAPATOS", label: "Zapatos" },
  { value: "DEPORTIVOS", label: "Deportivos" },
  { value: "OTROS", label: "Otros" },
];

type FormState = { error: string } | { success: true } | null;

interface Producto {
  id: string;
  sku: string;
  nombre: string;
  marca: string;
  modelo: string;
  descripcion: string | null;
  categoria: string;
  precio: number;
  imagenUrl: string | null;
}

export function EditarProductoForm({ producto }: { producto: Producto }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    actualizarProducto,
    null
  );

  useEffect(() => {
    if (state && "success" in state) {
      toast.success("Producto actualizado correctamente");
      router.push(`/dashboard/productos/${producto.id}`);
    } else if (state && "error" in state) {
      toast.error(state.error);
    }
  }, [state, router, producto.id]);

  return (
    <Card>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={producto.id} />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="SKU"
              name="sku"
              defaultValue={producto.sku}
              required
              disabled
            />
            <Input
              label="Nombre"
              name="nombre"
              defaultValue={producto.nombre}
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Marca"
              name="marca"
              defaultValue={producto.marca}
              required
            />
            <Input
              label="Modelo"
              name="modelo"
              defaultValue={producto.modelo}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Categoría"
              name="categoria"
              options={categorias}
              defaultValue={producto.categoria}
              required
            />
            <Input
              label="Precio"
              name="precio"
              type="number"
              step="0.01"
              min="0"
              defaultValue={producto.precio.toFixed(2)}
              required
            />
          </div>

          <Input
            label="Descripción (opcional)"
            name="descripcion"
            defaultValue={producto.descripcion ?? ""}
          />

          <Input
            label="URL de imagen (opcional)"
            name="imagenUrl"
            defaultValue={producto.imagenUrl ?? ""}
            type="url"
          />

          {state && "error" in state && (
            <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-600">
              {state.error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Link href={`/dashboard/productos/${producto.id}`}>
              <Button type="button" variant="ghost">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" loading={isPending}>
              Guardar Cambios
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

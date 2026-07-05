"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { crearProducto } from "../actions";
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

export default function NuevoProductoPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    crearProducto,
    null
  );

  useEffect(() => {
    if (state && "success" in state) {
      toast.success("Producto creado correctamente");
      router.push("/dashboard/productos");
    } else if (state && "error" in state) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link
          href="/dashboard/productos"
          className="text-sm text-indigo-600 hover:underline"
        >
          ← Volver a productos
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          Nuevo Producto
        </h1>
      </div>

      <Card>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="SKU"
                name="sku"
                placeholder="NIKE-AIR-MAX-90"
                required
                autoFocus
              />
              <Input
                label="Nombre"
                name="nombre"
                placeholder="Nike Air Max 90"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Marca"
                name="marca"
                placeholder="Nike"
                required
              />
              <Input
                label="Modelo"
                name="modelo"
                placeholder="Air Max 90"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select
                label="Categoría"
                name="categoria"
                options={categorias}
                required
              />
              <Input
                label="Precio"
                name="precio"
                type="number"
                step="0.01"
                min="0"
                placeholder="129.99"
                required
              />
            </div>

            <Input
              label="Descripción (opcional)"
              name="descripcion"
              placeholder="Descripción del producto..."
            />

            <Input
              label="URL de imagen (opcional)"
              name="imagenUrl"
              placeholder="https://..."
              type="url"
            />

            {state && "error" in state && (
              <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-600">
                {state.error}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Link href="/dashboard/productos">
                <Button type="button" variant="ghost">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" loading={isPending}>
                Crear Producto
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

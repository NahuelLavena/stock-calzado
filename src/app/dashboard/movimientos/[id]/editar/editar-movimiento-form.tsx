"use client";

import { useState, useEffect, useActionState, useMemo } from "react";
import Link from "next/link";
import { editarMovimiento, getProductosConTallajes } from "../../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

const tiposMovimiento = [
  { value: "ENTRADA", label: "Entrada" },
  { value: "SALIDA", label: "Salida" },
  { value: "AJUSTE_POS", label: "Ajuste positivo" },
  { value: "AJUSTE_NEG", label: "Ajuste negativo" },
  { value: "DEVOLUCION", label: "Devolución" },
];

type FormState = { error: string } | { success: true } | null;

interface ProductoConTallajes {
  id: string;
  nombre: string;
  sku: string;
  tallas: {
    id: string;
    talla: string;
    color: string;
    stock: number;
  }[];
}

interface MovimientoData {
  id: string;
  tipo: string;
  cantidad: number;
  motivo: string | null;
  tallajeId: string;
  tallaje: {
    id: string;
    talla: string;
    color: string;
    stock: number;
    producto: {
      id: string;
      nombre: string;
      sku: string;
    };
  };
}

export function EditarMovimientoForm({
  movimiento,
}: {
  movimiento: MovimientoData;
}) {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    editarMovimiento,
    null
  );

  const [productos, setProductos] = useState<ProductoConTallajes[]>([]);
  const [selectedProducto, setSelectedProducto] = useState(
    movimiento.tallaje.producto.id
  );

  useEffect(() => {
    getProductosConTallajes().then(setProductos);
  }, []);

  const tallajesDisponibles = useMemo(() => {
    if (!selectedProducto) return [];
    const producto = productos.find((p) => p.id === selectedProducto);
    return producto?.tallas || [];
  }, [selectedProducto, productos]);

  const opcionesTallajes = tallajesDisponibles.map((t) => ({
    value: t.id,
    label: `Talla ${t.talla} - ${t.color} (Stock: ${t.stock})`,
  }));

  return (
    <Card>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={movimiento.id} />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Producto
              </label>
              <select
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={selectedProducto}
                onChange={(e) => setSelectedProducto(e.target.value)}
              >
                <option value="">Seleccionar producto</option>
                {productos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} ({p.sku})
                  </option>
                ))}
              </select>
            </div>

            <Select
              label="Talla / Color"
              name="tallajeId"
              options={opcionesTallajes}
              placeholder="Seleccionar talla"
              required
              disabled={!selectedProducto}
              defaultValue={movimiento.tallajeId}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Tipo de movimiento"
              name="tipo"
              options={tiposMovimiento}
              required
              defaultValue={movimiento.tipo}
            />
            <Input
              label="Cantidad"
              name="cantidad"
              type="number"
              min="1"
              placeholder="1"
              required
              defaultValue={movimiento.cantidad}
            />
          </div>

          <Input
            label="Motivo (opcional)"
            name="motivo"
            placeholder="Descripción del movimiento..."
            defaultValue={movimiento.motivo ?? ""}
          />

          {state && "error" in state && (
            <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-600">
              {state.error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Link href={`/dashboard/movimientos/${movimiento.id}`}>
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

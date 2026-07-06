"use client";

import { useState, useEffect, useActionState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { crearVenta, getClientes } from "../actions";
import { getProductosConTallajes } from "../../movimientos/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

const metodosPago = [
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "TRANSFERENCIA", label: "Transferencia" },
  { value: "TARJETA_DEBITO", label: "Tarjeta Débito" },
  { value: "TARJETA_CREDITO", label: "Tarjeta Crédito" },
  { value: "OTRO", label: "Otro" },
];

type FormState = { error: string } | { success: true } | null;

interface Cliente {
  id: string;
  nombre: string;
}

interface ProductoConTallajes {
  id: string;
  nombre: string;
  sku: string;
  tallas: {
    id: string;
    talla: string;
    color: string;
    stock: number;
    precioEfectivo: number;
    precioTransferencia: number;
  }[];
}

export default function NuevaVentaPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    crearVenta,
    null
  );

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<ProductoConTallajes[]>([]);
  const [selectedProducto, setSelectedProducto] = useState("");
  const [selectedTallaje, setSelectedTallaje] = useState("");
  const [selectedMetodoPago, setSelectedMetodoPago] = useState("EFECTIVO");
  const [clienteMode, setClienteMode] = useState<"existing" | "new">("existing");
  const [selectedClienteId, setSelectedClienteId] = useState("");
  const [clienteNombre, setClienteNombre] = useState("");

  useEffect(() => {
    getClientes()
      .then(setClientes)
      .catch((err) => { console.error("Error loading clientes:", err); setClientes([]); });
    getProductosConTallajes()
      .then((data) => setProductos(data as ProductoConTallajes[]))
      .catch((err) => { console.error("Error loading productos:", err); setProductos([]); });
  }, []);

  useEffect(() => {
    if (state && "success" in state) {
      toast.success("Venta registrada correctamente");
      router.push("/dashboard/ventas");
    } else if (state && "error" in state) {
      toast.error(state.error);
    }
  }, [state, router]);

  const tallajesDisponibles = useMemo(() => {
    if (!selectedProducto) return [];
    const producto = productos.find((p) => p.id === selectedProducto);
    return producto?.tallas || [];
  }, [selectedProducto, productos]);

  const selectedTallajeData = useMemo(() => {
    return tallajesDisponibles.find((t) => t.id === selectedTallaje);
  }, [tallajesDisponibles, selectedTallaje]);

  const precioEstimado = useMemo(() => {
    if (!selectedTallajeData) return 0;
    return selectedMetodoPago === "EFECTIVO"
      ? selectedTallajeData.precioEfectivo
      : selectedTallajeData.precioTransferencia;
  }, [selectedTallajeData, selectedMetodoPago]);

  const opcionesTallajes = tallajesDisponibles.map((t) => ({
    value: t.id,
    label: `Talla ${t.talla} - ${t.color} (Stock: ${t.stock})`,
  }));

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link
          href="/dashboard/ventas"
          className="text-sm text-indigo-600 hover:underline"
        >
          ← Volver a ventas
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          Nueva Venta
        </h1>
      </div>

      <Card>
        <CardContent>
          <form action={formAction} className="space-y-4">
            {/* Client selection */}
            <div className="flex gap-4 border-b border-slate-200 pb-4">
              <button
                type="button"
                onClick={() => setClienteMode("existing")}
                className={`text-sm font-medium ${clienteMode === "existing" ? "text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}
              >
                Cliente existente
              </button>
              <button
                type="button"
                onClick={() => setClienteMode("new")}
                className={`text-sm font-medium ${clienteMode === "new" ? "text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}
              >
                Nuevo cliente
              </button>
            </div>

            {clienteMode === "existing" ? (
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Cliente
                </label>
                <select
                  name="clienteId"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={selectedClienteId}
                  onChange={(e) => setSelectedClienteId(e.target.value)}
                >
                  <option value="">Sin cliente (venta general)</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <Input
                label="Nombre del cliente"
                name="clienteNombre"
                placeholder="Nombre y apellido"
                value={clienteNombre}
                onChange={(e) => setClienteNombre(e.target.value)}
              />
            )}

            {/* Product selection */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Producto
                </label>
                <select
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={selectedProducto}
                  onChange={(e) => {
                    setSelectedProducto(e.target.value);
                    setSelectedTallaje("");
                  }}
                  autoFocus
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
                placeholder={selectedProducto ? "Seleccionar talla" : "Elegí un producto primero"}
                required
                value={selectedTallaje}
                onChange={(e) => setSelectedTallaje(e.target.value)}
              />
            </div>

            {/* Price preview */}
            {selectedTallajeData && (
              <div className="rounded-md bg-slate-50 p-3">
                <p className="text-sm text-slate-500">Precio unitario</p>
                <p className="text-lg font-bold text-slate-900">
                  ${precioEstimado.toFixed(2)}
                </p>
                <p className="text-xs text-slate-400">
                  {selectedMetodoPago === "EFECTIVO" ? "Precio efectivo" : "Precio transferencia"}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select
                label="Método de pago"
                name="metodoPago"
                options={metodosPago}
                required
                value={selectedMetodoPago}
                onChange={(e) => setSelectedMetodoPago(e.target.value)}
              />
              <Input
                label="Cantidad"
                name="cantidad"
                type="number"
                min="1"
                placeholder="1"
                required
              />
            </div>

            <Input
              label="Motivo (opcional)"
              name="motivo"
              placeholder="Descripción de la venta..."
            />

            {state && "error" in state && (
              <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-600">
                {state.error}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Link href="/dashboard/ventas">
                <Button type="button" variant="ghost">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" loading={isPending}>
                Registrar Venta
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

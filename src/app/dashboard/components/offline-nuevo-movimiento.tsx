"use client";

import { useState } from "react";
import { useProductosOffline } from "@/hooks/useProductosOffline";
import { useMovimientosOffline } from "@/hooks/useMovimientosOffline";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { Plus, AlertTriangle, CheckCircle } from "lucide-react";

const TIPOS = [
  { value: "ENTRADA", label: "Entrada" },
  { value: "SALIDA", label: "Salida" },
  { value: "DEVOLUCION", label: "Devolución" },
  { value: "AJUSTE_POS", label: "Ajuste +" },
  { value: "AJUSTE_NEG", label: "Ajuste -" },
];

export function OfflineNuevoMovimiento() {
  const isOnline = useOnlineStatus();
  const { productos, loading: loadingProductos } = useProductosOffline();
  const { createMovimiento } = useMovimientosOffline();

  const [productoId, setProductoId] = useState("");
  const [tallajeId, setTallajeId] = useState("");
  const [tipo, setTipo] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [motivo, setMotivo] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (isOnline) return null;

  const selectedProducto = productos.find((p) => p.id === productoId);
  const tallas = selectedProducto?.tallas || [];
  const selectedTallaje = tallas.find((t) => t.id === tallajeId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!tallajeId || !tipo || !cantidad) {
      setError("Todos los campos obligatorios deben estar completos");
      return;
    }

    const cantidadNum = parseInt(cantidad);
    if (isNaN(cantidadNum) || cantidadNum <= 0) {
      setError("La cantidad debe ser un número mayor a 0");
      return;
    }

    if ((tipo === "SALIDA" || tipo === "AJUSTE_NEG") && selectedTallaje) {
      if (selectedTallaje.stock < cantidadNum) {
        setError(`Stock insuficiente. Stock actual: ${selectedTallaje.stock}`);
        return;
      }
    }

    setSaving(true);
    try {
      const now = new Date().toISOString();
      const storedEmpresaId = localStorage.getItem("sc_empresaId") || "";
      const storedUsuarioId = localStorage.getItem("sc_usuarioId") || "";
      await createMovimiento({
        id: crypto.randomUUID(),
        empresaId: storedEmpresaId,
        tipo,
        cantidad: cantidadNum,
        motivo: motivo || null,
        usuarioId: storedUsuarioId,
        tallajeId,
        createdAt: now,
        _synced: false,
      });
      setSuccess(true);
      setProductoId("");
      setTallajeId("");
      setTipo("");
      setCantidad("");
      setMotivo("");
    } catch {
      setError("Error al guardar el movimiento");
    } finally {
      setSaving(false);
    }
  };

  if (loadingProductos) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <AlertTriangle className="mr-2 inline h-4 w-4" />
        Modo offline — el movimiento se sincronizará cuando vuelva la conexión
      </div>

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          <CheckCircle className="mr-2 inline h-4 w-4" />
          Movimiento guardado localmente. Se sincronizará al reconectarse.
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Producto *
          </label>
          <select
            value={productoId}
            onChange={(e) => {
              setProductoId(e.target.value);
              setTallajeId("");
            }}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="">Seleccionar producto</option>
            {productos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} ({p.sku})
              </option>
            ))}
          </select>
        </div>

        {tallas.length > 0 && (
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Talle / Color *
            </label>
            <select
              value={tallajeId}
              onChange={(e) => setTallajeId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">Seleccionar talle</option>
              {tallas.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.talla} / {t.color} (Stock: {t.stock})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Tipo *
            </label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">Seleccionar tipo</option>
              {TIPOS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Cantidad *
            </label>
            <input
              type="number"
              min="1"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Motivo
          </label>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="Motivo del movimiento (opcional)"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          {saving ? "Guardando..." : "Guardar Movimiento"}
        </button>
      </form>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Producto {
  nombre: string;
  sku: string;
  marca: string;
  categoria: string;
  totalVendido: number;
}

export function TopProductosChart() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics/top-productos")
      .then((res) => res.json())
      .then((data) => setProductos(data.productos ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (productos.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        No hay datos de ventas disponibles
      </div>
    );
  }

  const data = productos.map((p) => ({
    nombre: p.nombre.length > 15 ? p.nombre.slice(0, 15) + "..." : p.nombre,
    cantidad: p.totalVendido,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
        <XAxis type="number" />
        <YAxis type="category" dataKey="nombre" width={120} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="cantidad" fill="#3b82f6" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

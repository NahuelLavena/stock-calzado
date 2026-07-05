"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Categoria {
  nombre: string;
  cantidad: number;
  valor: number;
}

const COLORES = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

function formatLabel(value: string): string {
  const labels: Record<string, string> = {
    HOMBRES: "Hombres",
    MUJER: "Mujer",
    NINO: "Niño",
    NINA: "Niña",
    URBANAS: "Urbanas",
    BOTINES: "Botines",
    BEBE: "Bebé",
    JUVENIL: "Juvenil",
    PANTUFLAS: "Pantuflas",
    OJOTAS: "Ojotas",
  };
  return labels[value] ?? value;
}

export function VentasCategoriaChart() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics/ventas-por-categoria")
      .then((res) => res.json())
      .then((data) => setCategorias(data.categorias ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (categorias.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        No hay datos de categorías disponibles
      </div>
    );
  }

  const data = categorias.map((c) => ({
    name: formatLabel(c.nombre),
    value: c.cantidad,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) =>
            `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
          }
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORES[index % COLORES.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Tendencia {
  mes: string;
  cantidad: number;
  valor: number;
}

const MESES = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

function formatMes(mes: string): string {
  const [, m] = mes.split("-");
  return MESES[parseInt(m, 10) - 1] ?? mes;
}

export function TendenciaVentasChart() {
  const [tendencia, setTendencia] = useState<Tendencia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics/tendencia-ventas")
      .then((res) => res.json())
      .then((data) => setTendencia(data.tendencia ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (tendencia.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        No hay datos de tendencia disponibles
      </div>
    );
  }

  const data = tendencia.map((t) => ({
    mes: formatMes(t.mes),
    cantidad: t.cantidad,
    valor: t.valor,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ left: 10, right: 10 }}>
        <XAxis dataKey="mes" />
        <YAxis />
        <Tooltip />
        <Area
          type="monotone"
          dataKey="cantidad"
          stroke="#22c55e"
          fill="#22c55e40"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

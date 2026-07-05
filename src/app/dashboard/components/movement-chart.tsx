"use client";

import { useState, useMemo } from "react";

interface MovementChartProps {
  data: { fecha: string; entradas: number; salidas: number }[];
}

const PADDING = { top: 20, right: 20, bottom: 40, left: 50 };
const HEIGHT = 300;
const BAR_RADIUS = 3;

export function MovementChart({ data }: MovementChartProps) {
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    label: string;
    entradas: number;
    salidas: number;
  } | null>(null);

  const chart = useMemo(() => {
    if (data.length === 0) return null;

    const width = 800;
    const innerW = width - PADDING.left - PADDING.right;
    const innerH = HEIGHT - PADDING.top - PADDING.bottom;

    const maxVal = Math.max(
      ...data.map((d) => Math.max(d.entradas, d.salidas)),
      1
    );
    const yMax = Math.ceil(maxVal * 1.15);

    const barGroupWidth = innerW / data.length;
    const barWidth = Math.min(barGroupWidth * 0.35, 20);
    const gap = Math.min(barGroupWidth * 0.1, 4);

    const yTicks = 5;
    const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) =>
      Math.round((yMax / yTicks) * i)
    );

    return {
      width,
      innerW,
      innerH,
      yMax,
      barGroupWidth,
      barWidth,
      gap,
      yTickValues,
      bars: data.map((d, i) => {
        const x = PADDING.left + i * barGroupWidth + barGroupWidth / 2;
        const hEntradas = (d.entradas / yMax) * innerH;
        const hSalidas = (d.salidas / yMax) * innerH;
        return {
          x,
          entradasBar: {
            x: x - barWidth - gap / 2,
            y: PADDING.top + innerH - hEntradas,
            w: barWidth,
            h: hEntradas,
          },
          salidasBar: {
            x: x + gap / 2,
            y: PADDING.top + innerH - hSalidas,
            w: barWidth,
            h: hSalidas,
          },
          fecha: d.fecha,
          entradas: d.entradas,
          salidas: d.salidas,
        };
      }),
    };
  }, [data]);

  if (data.length === 0 || !chart) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-gray-500">
        No hay movimientos en los últimos 30 días.
      </div>
    );
  }

  const formatDate = (fecha: string) => {
    const d = new Date(fecha);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  };

  const formatFullDate = (fecha: string) => {
    const d = new Date(fecha);
    return d.toLocaleDateString("es-AR");
  };

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${chart.width} ${HEIGHT}`}
        className="w-full h-auto"
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Y axis grid lines + labels */}
        {chart.yTickValues.map((tick, i) => {
          const y = PADDING.top + chart.innerH - (tick / chart.yMax) * chart.innerH;
          return (
            <g key={`tick-${i}`}>
              <line
                x1={PADDING.left}
                y1={y}
                x2={PADDING.left + chart.innerW}
                y2={y}
                stroke="#f0f0f0"
                strokeDasharray="3 3"
              />
              <text
                x={PADDING.left - 8}
                y={y + 4}
                textAnchor="end"
                fontSize={11}
                fill="#6b7280"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* X axis */}
        <line
          x1={PADDING.left}
          y1={PADDING.top + chart.innerH}
          x2={PADDING.left + chart.innerW}
          y2={PADDING.top + chart.innerH}
          stroke="#e5e7eb"
        />

        {/* Bars */}
        {chart.bars.map((bar, i) => (
          <g key={i}>
            {/* Entradas bar */}
            <rect
              x={bar.entradasBar.x}
              y={bar.entradasBar.y}
              width={bar.entradasBar.w}
              height={bar.entradasBar.h}
              fill="#059669"
              rx={BAR_RADIUS}
              ry={BAR_RADIUS}
              onMouseEnter={(e) => {
                const rect = (e.target as SVGRectElement).closest("svg")?.getBoundingClientRect();
                if (rect) {
                  setTooltip({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top - 10,
                    label: bar.fecha,
                    entradas: bar.entradas,
                    salidas: bar.salidas,
                  });
                }
              }}
            />
            {/* Salidas bar */}
            <rect
              x={bar.salidasBar.x}
              y={bar.salidasBar.y}
              width={bar.salidasBar.w}
              height={bar.salidasBar.h}
              fill="#E11D48"
              rx={BAR_RADIUS}
              ry={BAR_RADIUS}
              onMouseEnter={(e) => {
                const rect = (e.target as SVGRectElement).closest("svg")?.getBoundingClientRect();
                if (rect) {
                  setTooltip({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top - 10,
                    label: bar.fecha,
                    entradas: bar.entradas,
                    salidas: bar.salidas,
                  });
                }
              }}
            />
            {/* X label */}
            <text
              x={bar.x}
              y={PADDING.top + chart.innerH + 16}
              textAnchor="middle"
              fontSize={10}
              fill="#6b7280"
            >
              {formatDate(bar.fecha)}
            </text>
          </g>
        ))}

        {/* Tooltip */}
        {tooltip && (
          <g>
            <rect
              x={tooltip.x - 70}
              y={tooltip.y - 58}
              width={140}
              height={52}
              rx={6}
              fill="white"
              stroke="#e5e7eb"
              filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
            />
            <text x={tooltip.x} y={tooltip.y - 40} textAnchor="middle" fontSize={11} fill="#374151" fontWeight="500">
              {formatFullDate(tooltip.label)}
            </text>
            <circle cx={tooltip.x - 50} cy={tooltip.y - 26} r={4} fill="#059669" />
            <text x={tooltip.x - 42} y={tooltip.y - 22} fontSize={10} fill="#374151">
              {tooltip.entradas} entradas
            </text>
            <circle cx={tooltip.x + 10} cy={tooltip.y - 26} r={4} fill="#E11D48" />
            <text x={tooltip.x + 18} y={tooltip.y - 22} fontSize={10} fill="#374151">
              {tooltip.salidas} salidas
            </text>
          </g>
        )}
      </svg>

      {/* Legend */}
      <div className="mt-2 flex items-center justify-center gap-4 text-xs text-slate-600">
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-sm bg-emerald-600" />
          Entradas
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-sm bg-rose-600" />
          Salidas
        </span>
      </div>
    </div>
  );
}

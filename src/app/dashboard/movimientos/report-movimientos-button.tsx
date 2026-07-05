"use client";

import { ReportButton } from "../components/report-button";

interface ReportMovimientosButtonProps {
  tipo?: string;
  productoId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

export function ReportMovimientosButton({
  tipo,
  productoId,
  fechaDesde,
  fechaHasta,
}: ReportMovimientosButtonProps) {
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const params = new URLSearchParams();
  if (tipo) params.set("tipo", tipo);
  if (productoId) params.set("productoId", productoId);
  if (fechaDesde) params.set("fechaDesde", fechaDesde);
  if (fechaHasta) params.set("fechaHasta", fechaHasta);

  const qs = params.toString();
  const url = `/api/reports/movimientos${qs ? `?${qs}` : ""}`;

  return (
    <ReportButton
      url={url}
      filename={`movimientos_${dateStr}.pdf`}
      label="Reporte PDF"
    />
  );
}

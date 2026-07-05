"use client";

import { ExportButton } from "@/components/ui/export-button";
import { base64ToBlob } from "@/lib/csv";
import { exportStockProductoCSV } from "../actions";

interface ExportStockButtonProps {
  productoId: string;
  productoNombre: string;
}

export function ExportStockButton({
  productoId,
  productoNombre,
}: ExportStockButtonProps) {
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const safeName = productoNombre.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();

  return (
    <ExportButton
      onExport={async () => {
        const b64 = await exportStockProductoCSV(productoId);
        return base64ToBlob(b64);
      }}
      filename={`stock_${safeName}_${dateStr}.csv`}
      label="Exportar Stock"
    />
  );
}

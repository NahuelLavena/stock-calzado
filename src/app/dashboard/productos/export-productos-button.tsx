"use client";

import { ExportButton } from "@/components/ui/export-button";
import { base64ToBlob } from "@/lib/csv";
import { exportProductosCSV } from "./actions";

interface ExportProductosButtonProps {
  filters: {
    search?: string;
    categoria?: string;
    estado?: string;
    marca?: string;
  };
}

export function ExportProductosButton({ filters }: ExportProductosButtonProps) {
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  return (
    <ExportButton
      onExport={async () => {
        const b64 = await exportProductosCSV(filters);
        return base64ToBlob(b64);
      }}
      filename={`productos_${dateStr}.csv`}
      label="Exportar CSV"
    />
  );
}

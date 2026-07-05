export const tipoLabels: Record<string, string> = {
  ENTRADA: "Entrada",
  SALIDA: "Salida",
  AJUSTE_POS: "Ajuste +",
  AJUSTE_NEG: "Ajuste -",
  DEVOLUCION: "Devolución",
};

export const tipoVariants: Record<
  string,
  "success" | "danger" | "warning" | "info" | "default"
> = {
  ENTRADA: "success",
  SALIDA: "danger",
  AJUSTE_POS: "info",
  AJUSTE_NEG: "warning",
  DEVOLUCION: "default",
};

export const MANAGED_BY_SUPABASE = "managed-by-supabase" as const;

import type { Metadata } from "next";
import { requireUsuarioAuth } from "@/lib/auth-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TopProductosChart } from "./components/top-productos-chart";
import { TendenciaVentasChart } from "./components/tendencia-ventas-chart";
import { VentasCategoriaChart } from "./components/ventas-categoria-chart";
import { VentasMarcaChart } from "./components/ventas-marca-chart";

export const metadata: Metadata = {
  title: "Analytics",
};

export default async function AnalyticsPage() {
  const usuario = await requireUsuarioAuth();

  if (usuario.rol !== "ADMIN") {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-slate-500">No tenés acceso a esta sección</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics de Ventas</h1>
        <p className="text-sm text-slate-500">
          Métricas de ventas y rendimiento de productos
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Productos Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <TopProductosChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tendencia de Ventas</CardTitle>
          </CardHeader>
          <CardContent>
            <TendenciaVentasChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ventas por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <VentasCategoriaChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ventas por Marca</CardTitle>
          </CardHeader>
          <CardContent>
            <VentasMarcaChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

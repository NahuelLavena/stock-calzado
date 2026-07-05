import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUsuarioActual } from "@/lib/session";
import { ConfigForm } from "./config-form";

export const metadata: Metadata = {
  title: "Configuración",
};

export default async function ConfiguracionPage() {
  const usuario = await getUsuarioActual();

  if (!usuario || usuario.rol !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Configuración</h1>

      <ConfigForm
        empresa={{
          nombre: usuario.empresa.nombre,
          logo: usuario.empresa.logo,
          slug: usuario.empresa.slug,
        }}
      />
    </div>
  );
}

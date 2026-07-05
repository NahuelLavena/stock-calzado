import type { Metadata } from "next";
import { getUsuarioActual } from "@/lib/session";
import { PerfilForm } from "./perfil-form";

export const metadata: Metadata = {
  title: "Mi Perfil",
};

export default async function PerfilPage() {
  const usuario = await getUsuarioActual();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Mi Perfil</h1>

      <PerfilForm
        usuario={{
          nombre: usuario?.nombre || "",
          email: usuario?.email || "",
          rol: usuario?.rol || "",
        }}
      />
    </div>
  );
}

"use server";

import { prisma } from "@/lib/prisma";
import { getUsuarioActual } from "@/lib/session";
import { actualizarEmpresaSchema } from "@/lib/validations/perfil";

type EmpresaState = { error: string } | { success: true } | null;

export async function actualizarEmpresa(
  prevState: EmpresaState,
  formData: FormData
): Promise<EmpresaState> {
  const usuario = await getUsuarioActual();
  if (!usuario || usuario.rol !== "ADMIN") {
    return { error: "No autorizado" };
  }

  const parsed = actualizarEmpresaSchema.safeParse({
    nombre: formData.get("nombre"),
    logo: formData.get("logo"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await prisma.empresa.update({
    where: { id: usuario.empresaId },
    data: {
      nombre: parsed.data.nombre,
      logo: parsed.data.logo || null,
    },
  });

  return { success: true };
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getUsuarioActual } from "@/lib/session";
import { actualizarPerfilSchema, cambiarContrasenaSchema } from "@/lib/validations/perfil";

type PerfilState = { error: string } | { success: true } | null;

export async function actualizarPerfil(
  prevState: PerfilState,
  formData: FormData
): Promise<PerfilState> {
  const usuario = await getUsuarioActual();
  if (!usuario) return { error: "No autorizado" };

  const parsed = actualizarPerfilSchema.safeParse({
    nombre: formData.get("nombre"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { nombre: parsed.data.nombre },
  });

  return { success: true };
}

export async function cambiarContrasena(
  prevState: PerfilState,
  formData: FormData
): Promise<PerfilState> {
  const usuario = await getUsuarioActual();
  if (!usuario) return { error: "No autorizado" };

  const parsed = cambiarContrasenaSchema.safeParse({
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

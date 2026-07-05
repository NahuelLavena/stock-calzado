"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getUsuarioActual } from "@/lib/session";
import { crearUsuarioSchema, actualizarUsuarioSchema } from "@/lib/validations/usuario";
import { MANAGED_BY_SUPABASE } from "@/lib/constants";

type UsuarioState = { error: string } | { success: true } | null;

export async function getUsuariosEmpresa() {
  const usuario = await getUsuarioActual();
  if (!usuario || usuario.rol !== "ADMIN") {
    throw new Error("No autorizado");
  }

  return prisma.usuario.findMany({
    where: { empresaId: usuario.empresaId },
    orderBy: { createdAt: "asc" },
  });
}

export async function getUsuarioPorId(id: string) {
  const usuario = await getUsuarioActual();
  if (!usuario) throw new Error("No autorizado");

  const target = await prisma.usuario.findFirst({
    where: { id, empresaId: usuario.empresaId },
  });
  if (!target) throw new Error("Usuario no encontrado");

  if (usuario.rol !== "ADMIN" && usuario.id !== id) {
    throw new Error("No autorizado");
  }

  return target;
}

export async function crearUsuario(
  prevState: UsuarioState,
  formData: FormData
): Promise<UsuarioState> {
  const usuario = await getUsuarioActual();
  if (!usuario || usuario.rol !== "ADMIN") {
    return { error: "No autorizado" };
  }

  const parsed = crearUsuarioSchema.safeParse({
    email: formData.get("email"),
    nombre: formData.get("nombre"),
    password: formData.get("password"),
    rol: formData.get("rol"),
    puedeEditarStock: formData.get("puedeEditarStock") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { email, nombre, password, rol, puedeEditarStock } = parsed.data;

  const existing = await prisma.usuario.findUnique({ where: { email } });
  if (existing) {
    return { error: "Ya existe un usuario con este email" };
  }

  const supabaseAdmin = createAdminClient();

  const { data: authData, error: signUpError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nombre },
    });

  if (signUpError) {
    return { error: signUpError.message };
  }

  if (!authData.user) {
    return { error: "Error al crear el usuario en Supabase" };
  }

  await prisma.usuario.create({
    data: {
      supabaseUserId: authData.user.id,
      email,
      nombre,
      passwordHash: MANAGED_BY_SUPABASE,
      rol,
      empresaId: usuario.empresaId,
      puedeEditarStock: rol !== "ADMIN" && puedeEditarStock,
    },
  });

  return { success: true };
}

export async function actualizarUsuario(
  prevState: UsuarioState,
  formData: FormData
): Promise<UsuarioState> {
  const usuarioActual = await getUsuarioActual();
  if (!usuarioActual || usuarioActual.rol !== "ADMIN") {
    return { error: "No autorizado" };
  }

  const parsed = actualizarUsuarioSchema.safeParse({
    id: formData.get("id"),
    nombre: formData.get("nombre"),
    rol: formData.get("rol"),
    puedeEditarStock: formData.get("puedeEditarStock") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { id, nombre, rol, puedeEditarStock } = parsed.data;

  const target = await prisma.usuario.findFirst({
    where: { id, empresaId: usuarioActual.empresaId },
  });

  if (!target) {
    return { error: "Usuario no encontrado" };
  }

  await prisma.usuario.update({
    where: { id },
    data: {
      nombre,
      rol,
      puedeEditarStock: rol !== "ADMIN" && puedeEditarStock,
    },
  });

  return { success: true };
}

export async function eliminarUsuario(id: string): Promise<UsuarioState> {
  const usuarioActual = await getUsuarioActual();
  if (!usuarioActual || usuarioActual.rol !== "ADMIN") {
    return { error: "No autorizado" };
  }

  if (id === usuarioActual.id) {
    return { error: "No podés eliminar tu propio usuario" };
  }

  const target = await prisma.usuario.findFirst({
    where: { id, empresaId: usuarioActual.empresaId },
  });

  if (!target) {
    return { error: "Usuario no encontrado" };
  }

  await prisma.usuario.delete({ where: { id } });

  return { success: true };
}

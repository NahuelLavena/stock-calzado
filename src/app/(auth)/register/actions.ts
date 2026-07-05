"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { checkAuthRateLimit } from "@/lib/rate-limit";
import { MANAGED_BY_SUPABASE } from "@/lib/constants";

type RegisterState = { error: string } | { success: true } | null;

export async function register(
  prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const { allowed } = checkAuthRateLimit(`register:${email}`);
  if (!allowed) {
    return { error: "Demasiados intentos. Esperá un minuto e intentá de nuevo." };
  }

  const supabase = await createClient();

  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    nombre: formData.get("nombre"),
    empresa: formData.get("empresa"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { password, nombre, empresa: empresaNombre } = parsed.data;

  const slug = empresaNombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  let empresa = await prisma.empresa.findUnique({ where: { slug } });

  if (!empresa) {
    try {
      empresa = await prisma.empresa.create({
        data: { nombre: empresaNombre, slug },
      });
    } catch {
      empresa = await prisma.empresa.findUnique({ where: { slug } });
      if (!empresa) {
        return { error: "Error al crear la empresa" };
      }
    }
  }

  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nombre, empresaNombre } },
  });

  if (signUpError) {
    if (signUpError.message.includes("already")) {
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        return {
          error:
            "Este email ya está registrado pero la contraseña no coincide.",
        };
      }

      const existingUser = await prisma.usuario.findUnique({
        where: { email },
      });

      if (!existingUser && signInData.user) {
        await prisma.usuario.create({
          data: {
            supabaseUserId: signInData.user.id,
            email,
            nombre,
            passwordHash: MANAGED_BY_SUPABASE,
            rol: "ADMIN",
            empresaId: empresa.id,
          },
        });
      }

      return { success: true };
    }

    return { error: signUpError.message };
  }

  if (!authData.user) {
    return { error: "Error al crear el usuario" };
  }

  if (authData.user.identities?.length === 0) {
    return { error: "Este email ya está registrado" };
  }

  const existingUser = await prisma.usuario.findUnique({ where: { email } });

  if (!existingUser) {
    await prisma.usuario.create({
      data: {
        supabaseUserId: authData.user.id,
        email,
        nombre,
        passwordHash: "managed-by-supabase",
        rol: "ADMIN",
        empresaId: empresa.id,
      },
    });
  } else if (!existingUser.supabaseUserId) {
    await prisma.usuario.update({
      where: { email },
      data: { supabaseUserId: authData.user.id },
    });
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    return {
      error:
        "Cuenta creada pero hubo un error al iniciar sesión. Probá iniciar sesión manualmente.",
    };
  }

  return { success: true };
}

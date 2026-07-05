"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";
import { checkAuthRateLimit } from "@/lib/rate-limit";

type LoginState = { error: string } | { success: true; offlineSession?: Record<string, unknown> } | null;

export async function login(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const { allowed } = checkAuthRateLimit(email);
  if (!allowed) {
    return { error: "Demasiados intentos. Esperá un minuto e intentá de nuevo." };
  }

  const supabase = await createClient();

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { password } = parsed.data;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.includes("Invalid login")) {
      return { error: "Email o contraseña incorrectos" };
    }
    return { error: error.message };
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const usuario = await prisma.usuario.findUnique({
        where: { supabaseUserId: user.id },
        include: { empresa: true },
      });

      if (usuario) {
        const sessionData = {
          id: usuario.id,
          email: usuario.email,
          nombre: usuario.nombre,
          rol: usuario.rol,
          empresaId: usuario.empresaId,
          empresaNombre: usuario.empresa.nombre,
          puedeEditarStock: usuario.puedeEditarStock,
          createdAt: usuario.createdAt.toISOString(),
        };

        return {
          success: true,
          offlineSession: sessionData,
        };
      }
    }
  } catch {
    // If we can't fetch user data, still allow login
  }

  return { success: true };
}

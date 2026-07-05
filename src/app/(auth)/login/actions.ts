"use server";

import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validations/auth";
import { checkAuthRateLimit } from "@/lib/rate-limit";

type LoginState = { error: string } | { success: true } | null;

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

  return { success: true };
}

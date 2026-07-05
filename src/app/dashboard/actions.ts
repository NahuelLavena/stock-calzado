"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function logout() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Supabase unavailable — continue with local logout
  }

  try {
    const cookieStore = await cookies();
    cookieStore.delete("sc_offline_session");
  } catch {
    // Cookie cleanup failed — non-critical
  }

  redirect("/login");
}

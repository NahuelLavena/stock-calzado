import { cache } from "react";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getOfflineSessionFromCookie } from "@/lib/offline-auth";

export const getUsuarioActual = cache(async () => {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const usuario = await prisma.usuario.findUnique({
        where: { supabaseUserId: user.id },
        include: { empresa: true },
      });

      if (usuario) return usuario;
    }
  } catch {
    // Supabase or Prisma unavailable (offline) — try offline session
  }

  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.get("sc_offline_session")?.value;
    if (!cookieHeader) return null;

    const session = getOfflineSessionFromCookie(`sc_offline_session=${cookieHeader}`);
    if (!session) return null;

    return {
      id: session.id,
      email: session.email,
      nombre: session.nombre,
      rol: session.rol as "ADMIN" | "VENDEDOR" | "ALMACENERO",
      empresaId: session.empresaId,
      puedeEditarStock: session.puedeEditarStock,
      supabaseUserId: "",
      passwordHash: "managed-by-offline",
      activo: true,
      createdAt: new Date(session.createdAt),
      updatedAt: new Date(session.createdAt),
      empresa: {
        id: session.empresaId,
        nombre: session.empresaNombre,
        cuit: "",
        direccion: null,
        telefono: null,
        email: null,
        activo: true,
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.createdAt),
      },
    };
  } catch {
    return null;
  }
});



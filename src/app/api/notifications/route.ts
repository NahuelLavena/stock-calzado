import { NextResponse } from "next/server";
import { getUsuarioActual } from "@/lib/session";
import { getNotificaciones } from "@/lib/notifications";

export async function GET() {
  try {
    const usuario = await getUsuarioActual();
    if (!usuario) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const notificaciones = await getNotificaciones(usuario.empresaId, 20);
    return NextResponse.json({ notificaciones });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

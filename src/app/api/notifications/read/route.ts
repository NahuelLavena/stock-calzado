import { NextRequest, NextResponse } from "next/server";
import { getUsuarioActual } from "@/lib/session";
import { marcarLeida, marcarTodasLeidas } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  try {
    const usuario = await getUsuarioActual();
    if (!usuario) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { notificacionId } = body;

    if (notificacionId) {
      await marcarLeida(notificacionId, usuario.empresaId);
    } else {
      await marcarTodasLeidas(usuario.empresaId);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

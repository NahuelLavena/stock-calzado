import { redirect } from "next/navigation";
import { getUsuarioActual } from "@/lib/session";
import { getNoLeidasCount, getNotificaciones } from "@/lib/notifications";
import { logout } from "./actions";
import { Sidebar } from "./components/sidebar";
import { ToastProvider } from "./components/toast-provider";
import { OfflineProvider, HeaderSyncBadge } from "./components/offline-provider";
import { DexieSeeder } from "./components/dexie-seeder";
import { NotificationBell } from "@/components/ui/notification-bell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const usuario = await getUsuarioActual();

  if (!usuario) {
    redirect("/login");
  }

  let noLeidasCount = 0;
  let notificacionesJson: Array<{
    id: string;
    tipo: string;
    titulo: string;
    mensaje: string;
    leido: boolean;
    createdAt: string;
  }> = [];

  try {
    const [count, notificaciones] = await Promise.all([
      getNoLeidasCount(usuario.empresaId),
      getNotificaciones(usuario.empresaId, 20),
    ]);
    noLeidasCount = count;
    notificacionesJson = notificaciones.map((n) => ({
      id: n.id,
      tipo: n.tipo,
      titulo: n.titulo,
      mensaje: n.mensaje,
      leido: n.leido,
      createdAt: n.createdAt.toISOString(),
    }));
  } catch {
    // Notifications are non-critical — render without them
  }

  return (
    <OfflineProvider>
      <DexieSeeder />
      <div className="flex min-h-screen bg-slate-50">
        <ToastProvider />
        <Sidebar
          empresaNombre={usuario.empresa.nombre}
          usuarioNombre={usuario.nombre}
          usuarioRol={usuario.rol}
        />

        <div className="flex flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 pl-16 lg:px-6 lg:pl-6">
            <div className="min-w-0 flex-1 text-sm text-slate-600">
              <span className="font-medium text-slate-900 truncate block">
                {usuario.nombre}
              </span>
              <span className="capitalize">{usuario.rol.toLowerCase()}</span>
            </div>

            <div className="flex items-center gap-2">
              <HeaderSyncBadge />
              <NotificationBell
                initialCount={noLeidasCount}
                initialNotificaciones={notificacionesJson}
                empresaId={usuario.empresaId}
              />
              <form action={logout}>
                <button
                  type="submit"
                  className="whitespace-nowrap rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                >
                  Cerrar sesión
                </button>
              </form>
            </div>
          </header>

          <main id="main-content" className="flex-1 p-3 sm:p-6">{children}</main>
        </div>
      </div>
    </OfflineProvider>
  );
}

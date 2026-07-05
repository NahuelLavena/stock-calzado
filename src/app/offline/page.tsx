"use client";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 text-6xl">📡</div>
        <h1 className="mb-2 text-2xl font-bold text-slate-900">
          Sin conexión
        </h1>
        <p className="mb-6 text-slate-600">
          No se pudo conectar a internet. Algunas funciones pueden estar
          disponibles en modo offline.
        </p>
        <div className="space-y-3">
          <a
            href="/dashboard"
            className="block w-full rounded-md bg-indigo-600 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-indigo-700"
          >
            Ir al Dashboard
          </a>
          <button
            onClick={() => window.location.reload()}
            className="block w-full rounded-md border border-slate-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Reintentar conexión
          </button>
        </div>
        <p className="mt-6 text-xs text-slate-500">
          Los cambios realizados offline se sincronizarán automáticamente cuando
          se restaure la conexión.
        </p>
      </div>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Notificacion {
  id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  leido: boolean;
  createdAt: string;
}

interface NotificationBellProps {
  initialCount: number;
  initialNotificaciones: Notificacion[];
  empresaId: string;
}

export function NotificationBell({
  initialCount,
  initialNotificaciones,
  empresaId,
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [notificaciones, setNotificaciones] = useState(initialNotificaciones);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (
      panelRef.current &&
      !panelRef.current.contains(e.target as Node) &&
      buttonRef.current &&
      !buttonRef.current.contains(e.target as Node)
    ) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  const toggle = async () => {
    if (!open) {
      const res = await fetch(`/api/notifications?empresaId=${empresaId}`);
      if (res.ok) {
        const data = await res.json();
        setNotificaciones(data.notificaciones);
        setCount(data.notificaciones.filter((n: Notificacion) => !n.leido).length);
      }
    }
    setOpen(!open);
  };

  const marcarTodasLeidas = async () => {
    await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ empresaId }),
    });
    setCount(0);
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leido: true })));
  };

  const marcarUnaLeida = async (id: string) => {
    await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificacionId: id }),
    });
    setCount((prev) => Math.max(0, prev - 1));
    setNotificaciones((prev) =>
      prev.map((n) => (n.id === id ? { ...n, leido: true } : n))
    );
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={toggle}
        className="relative rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
        aria-label="Notificaciones"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-slate-200 bg-white shadow-lg"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-900">
              Notificaciones
            </h3>
            {count > 0 && (
              <button
                onClick={marcarTodasLeidas}
                className="text-xs text-indigo-600 hover:underline"
              >
                Marcar todas leídas
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notificaciones.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-500">
                Sin notificaciones
              </div>
            ) : (
              notificaciones.map((n) => (
                <div
                  key={n.id}
                  className={`cursor-pointer border-b border-slate-50 px-4 py-3 transition-colors hover:bg-slate-50 ${
                    !n.leido ? "bg-indigo-50/50" : ""
                  }`}
                  onClick={() => !n.leido && marcarUnaLeida(n.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm ${
                          !n.leido ? "font-semibold text-slate-900" : "text-slate-700"
                        }`}
                      >
                        {n.titulo}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">
                        {n.mensaje}
                      </p>
                    </div>
                    {!n.leido && (
                      <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-indigo-500" />
                    )}
                  </div>
                  <p className="mt-1 text-[10px] text-slate-400">
                    {new Date(n.createdAt).toLocaleDateString("es-AR")}{" "}
                    {new Date(n.createdAt).toLocaleTimeString("es-AR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

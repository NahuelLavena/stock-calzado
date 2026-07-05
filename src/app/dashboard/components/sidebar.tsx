"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Inicio", icon: "🏠" },
  { href: "/dashboard/productos", label: "Productos", icon: "👟" },
  { href: "/dashboard/movimientos", label: "Movimientos", icon: "📦" },
  { href: "/dashboard/analytics", label: "Analytics", icon: "📊", adminOnly: true },
  { href: "/dashboard/usuarios", label: "Usuarios", icon: "👥", adminOnly: true },
];

interface SidebarProps {
  empresaNombre: string;
  usuarioNombre: string;
  usuarioRol: string;
}

export function Sidebar({
  empresaNombre,
  usuarioNombre,
  usuarioRol,
}: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const navContent = (
    <>
      <div className="p-6">
        <h2 className="text-lg font-bold text-slate-900">{empresaNombre}</h2>
        <p className="text-sm text-slate-500">Stock Calzado</p>
      </div>

      <nav aria-label="Menú principal" className="flex-1 space-y-1 px-3">
        {navItems
          .filter((item) => !item.adminOnly || usuarioRol === "ADMIN")
          .map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <div className="mb-3 text-sm">
          <p className="font-medium text-slate-900">{usuarioNombre}</p>
          <p className="capitalize text-slate-500">
            {usuarioRol.toLowerCase()}
          </p>
        </div>
        <div className="space-y-1">
          <Link
            href="/dashboard/perfil"
            onClick={() => setMobileOpen(false)}
            className={`block rounded-md px-3 py-2 text-sm transition-colors ${
              isActive("/dashboard/perfil")
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Mi Perfil
          </Link>
          {usuarioRol === "ADMIN" && (
            <Link
              href="/dashboard/configuracion"
              onClick={() => setMobileOpen(false)}
              className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                isActive("/dashboard/configuracion")
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Configuración
            </Link>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-md bg-white p-2.5 shadow-md lg:hidden"
        aria-label="Abrir menú"
      >
        <svg
          className="h-5 w-5 text-slate-700"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        aria-label="Menú de navegación"
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white transition-transform lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute right-4 top-4 rounded-md p-2 text-slate-400 hover:text-slate-600 lg:hidden"
          aria-label="Cerrar menú"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        {navContent}
      </aside>
    </>
  );
}

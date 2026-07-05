"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "./actions";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { db } from "@/lib/db";
import { setOfflineSessionCookie } from "@/lib/offline-auth";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

type LoginState = { error: string } | { success: true; offlineSession?: Record<string, unknown> } | null;

export default function LoginPage() {
  const router = useRouter();
  const isOnline = useOnlineStatus();
  const [offlineError, setOfflineError] = useState<string | null>(null);
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(
    login,
    null
  );

  useEffect(() => {
    if (state && "success" in state) {
      if (state.offlineSession) {
        const session = state.offlineSession;
        db.authSession.put({
          id: session.id as string,
          email: session.email as string,
          nombre: session.nombre as string,
          rol: session.rol as string,
          empresaId: session.empresaId as string,
          empresaNombre: session.empresaNombre as string,
          puedeEditarStock: session.puedeEditarStock as boolean,
          createdAt: session.createdAt as string,
        });
        setOfflineSessionCookie({
          id: session.id as string,
          email: session.email as string,
          nombre: session.nombre as string,
          rol: session.rol as string,
          empresaId: session.empresaId as string,
          empresaNombre: session.empresaNombre as string,
          puedeEditarStock: session.puedeEditarStock as boolean,
          createdAt: session.createdAt as string,
        });
      }
      router.push("/dashboard");
    }
  }, [state, router]);

  async function handleOfflineLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setOfflineError(null);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") || "").trim().toLowerCase();

    try {
      const sessions = await db.authSession.toArray();
      const session = sessions.find((s) => s.email === email);

      if (!session) {
        setOfflineError("No hay sesión guardada para este email. Conectate a internet para el primer inicio de sesión.");
        return;
      }

      setOfflineSessionCookie(session);
      router.push("/dashboard");
    } catch {
      setOfflineError("Error al acceder a los datos locales.");
    }
  }

  if (!isOnline) {
    return (
      <div className="rounded-lg bg-white p-5 shadow-md sm:p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Modo Offline</h1>
          <p className="mt-1 text-sm text-slate-500">
            Ingresá tu email para acceder con la sesión guardada
          </p>
        </div>

        <form onSubmit={handleOfflineLogin} className="space-y-4">
          <Input
            label="Email"
            id="email"
            name="email"
            type="email"
            required
            placeholder="tu@email.com"
            autoComplete="email"
          />

          {offlineError && (
            <Alert variant="error" aria-live="polite">
              {offlineError}
            </Alert>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isPending}
            className="w-full"
          >
            Ingresar Offline
          </Button>
        </form>

        <div className="mt-4 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
          <p>
            Sin conexión a internet. Solo podés acceder si tenés una sesión guardada previamente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-5 shadow-md sm:p-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Iniciar Sesión</h1>
        <p className="mt-1 text-sm text-slate-500">
          Ingresá tus credenciales para continuar
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <Input
          label="Email"
          id="email"
          name="email"
          type="email"
          required
          placeholder="tu@email.com"
          autoComplete="email"
        />

        <Input
          label="Contraseña"
          id="password"
          name="password"
          type="password"
          required
          placeholder="••••••••"
          autoComplete="current-password"
        />

        {state && "error" in state && (
          <Alert variant="error" aria-live="polite">
            {state.error}
          </Alert>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isPending}
          className="w-full"
        >
          Ingresar
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        ¿No tenés cuenta?{" "}
        <Link
          href="/register"
          className="font-medium text-indigo-600 hover:text-indigo-500"
        >
          Registrate
        </Link>
      </p>
    </div>
  );
}

"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login } from "./actions";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

type LoginState = { error: string } | { success: true } | null;

export default function LoginPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(
    login,
    null
  );

  useEffect(() => {
    if (state && "success" in state) {
      router.push("/dashboard");
    }
  }, [state, router]);

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

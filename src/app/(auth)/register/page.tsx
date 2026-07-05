"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { register } from "./actions";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

type RegisterState = { error: string } | { success: true } | null;

export default function RegisterPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<RegisterState, FormData>(
    register,
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
        <h1 className="text-2xl font-bold text-slate-900">Crear Cuenta</h1>
        <p className="mt-1 text-sm text-slate-500">
          Registrate para empezar a gestionar tu stock
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <Input
          label="Nombre"
          id="nombre"
          name="nombre"
          type="text"
          required
          placeholder="Tu nombre"
          autoComplete="name"
        />

        <Input
          label="Empresa"
          id="empresa"
          name="empresa"
          type="text"
          required
          placeholder="Nombre de tu empresa"
          autoComplete="organization"
        />

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
          minLength={6}
          placeholder="Mínimo 6 caracteres"
          autoComplete="new-password"
        />

        <Input
          label="Confirmar contraseña"
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          placeholder="Repetí tu contraseña"
          autoComplete="new-password"
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
          Crear Cuenta
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        ¿Ya tenés cuenta?{" "}
        <Link
          href="/login"
          className="font-medium text-indigo-600 hover:text-indigo-500"
        >
          Iniciá sesión
        </Link>
      </p>
    </div>
  );
}

"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { crearUsuario } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

type FormState = { error: string } | { success: true } | null;

const roles = [
  { value: "ADMIN", label: "Administrador" },
  { value: "VENDEDOR", label: "Vendedor" },
  { value: "ALMACENERO", label: "Almacenero" },
];

export default function NuevoUsuarioPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    crearUsuario,
    null
  );

  useEffect(() => {
    if (state && "success" in state) {
      toast.success("Usuario creado correctamente");
      router.push("/dashboard/usuarios");
    } else if (state && "error" in state) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link
          href="/dashboard/usuarios"
          className="text-sm text-indigo-600 hover:underline"
        >
          ← Volver a usuarios
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          Nuevo Usuario
        </h1>
      </div>

      <Card>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <Input
              name="nombre"
              label="Nombre"
              placeholder="Nombre del usuario"
              required
              autoFocus
            />

            <Input
              name="email"
              label="Email"
              type="email"
              placeholder="usuario@email.com"
              required
            />

            <Input
              name="password"
              label="Contraseña"
              type="password"
              placeholder="Mínimo 6 caracteres"
              required
            />

            <Select name="rol" label="Rol" options={roles} required />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="puedeEditarStock"
                id="puedeEditarStock"
                className="h-4 w-4 rounded border-slate-300"
              />
              <label htmlFor="puedeEditarStock" className="text-sm text-slate-700">
                Puede editar stock
              </label>
            </div>

            <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creando..." : "Crear Usuario"}
              </Button>
              <Link href="/dashboard/usuarios">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

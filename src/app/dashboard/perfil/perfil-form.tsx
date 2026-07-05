"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { actualizarPerfil, cambiarContrasena } from "./actions";

type PerfilState = { error: string } | { success: true } | null;

interface PerfilFormProps {
  usuario: {
    nombre: string;
    email: string;
    rol: string;
  };
}

export function PerfilForm({ usuario }: PerfilFormProps) {
  const [perfilState, perfilAction, perfilPending] = useActionState<
    PerfilState,
    FormData
  >(actualizarPerfil, null);

  const [passState, passAction, passPending] = useActionState<
    PerfilState,
    FormData
  >(cambiarContrasena, null);

  useEffect(() => {
    if (perfilState && "success" in perfilState) {
      toast.success("Perfil actualizado correctamente");
    } else if (perfilState && "error" in perfilState) {
      toast.error(perfilState.error);
    }
  }, [perfilState]);

  useEffect(() => {
    if (passState && "success" in passState) {
      toast.success("Contraseña actualizada correctamente");
    } else if (passState && "error" in passState) {
      toast.error(passState.error);
    }
  }, [passState]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Datos personales
          </h2>

          <form action={perfilAction} className="space-y-4">
            <Input
              name="nombre"
              label="Nombre"
              defaultValue={usuario.nombre}
              required
              autoFocus
            />

            <Input
              name="email"
              label="Email"
              type="email"
              defaultValue={usuario.email}
              disabled
            />

            <Input
              name="rol"
              label="Rol"
              defaultValue={usuario.rol}
              disabled
            />

            <Button type="submit" disabled={perfilPending}>
              {perfilPending ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Cambiar contraseña
          </h2>

          <form action={passAction} className="space-y-4">
            <Input
              name="password"
              label="Nueva contraseña"
              type="password"
              placeholder="Mínimo 6 caracteres"
              required
            />

            <Button type="submit" disabled={passPending}>
              {passPending ? "Actualizando..." : "Actualizar Contraseña"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

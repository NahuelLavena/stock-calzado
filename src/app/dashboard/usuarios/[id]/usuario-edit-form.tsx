"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { actualizarUsuario, eliminarUsuario } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type FormState = { error: string } | { success: true } | null;

const roles = [
  { value: "ADMIN", label: "Administrador" },
  { value: "VENDEDOR", label: "Vendedor" },
  { value: "ALMACENERO", label: "Almacenero" },
];

interface UsuarioFormProps {
  usuario: {
    id: string;
    nombre: string;
    email: string;
    rol: string;
    puedeEditarStock: boolean;
    esAdminActual: boolean;
  };
}

export function UsuarioEditForm({ usuario }: UsuarioFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    actualizarUsuario,
    null
  );
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (state && "success" in state) {
      toast.success("Usuario actualizado correctamente");
      router.push("/dashboard/usuarios");
    } else if (state && "error" in state) {
      toast.error(state.error);
    }
  }, [state, router]);

  const handleDelete = async () => {
    const result = await eliminarUsuario(usuario.id);
    if (result && "success" in result) {
      toast.success("Usuario eliminado correctamente");
      router.push("/dashboard/usuarios");
    } else if (result && "error" in result) {
      toast.error(result.error);
    }
  };

  return (
    <>
      <Card>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="id" value={usuario.id} />

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

            <Select
              name="rol"
              label="Rol"
              options={roles}
              defaultValue={usuario.rol}
              required
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="puedeEditarStock"
                id="puedeEditarStock"
                defaultChecked={usuario.puedeEditarStock}
                className="h-4 w-4 rounded border-slate-300"
              />
              <label
                htmlFor="puedeEditarStock"
                className="text-sm text-slate-700"
              >
                Puede editar stock
              </label>
            </div>

            <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Guardando..." : "Guardar Cambios"}
              </Button>
              {!usuario.esAdminActual && (
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => setShowConfirm(true)}
                >
                  Eliminar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Eliminar usuario"
        message={`¿Estás seguro de que querés eliminar a ${usuario.nombre}? Esta acción no se puede deshacer.`}
      />
    </>
  );
}

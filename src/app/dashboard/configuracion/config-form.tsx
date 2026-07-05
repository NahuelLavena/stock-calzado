"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { actualizarEmpresa } from "./actions";

type EmpresaState = { error: string } | { success: true } | null;

interface ConfigFormProps {
  empresa: {
    nombre: string;
    logo: string | null;
    slug: string;
  };
}

export function ConfigForm({ empresa }: ConfigFormProps) {
  const [state, formAction, isPending] = useActionState<EmpresaState, FormData>(
    actualizarEmpresa,
    null
  );

  useEffect(() => {
    if (state && "success" in state) {
      toast.success("Empresa actualizada correctamente");
    } else if (state && "error" in state) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <Card>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <Input
            name="nombre"
            label="Nombre de la empresa"
            defaultValue={empresa.nombre}
            required
            autoFocus
          />

          <Input
            name="logo"
            label="Logo URL (opcional)"
            type="url"
            defaultValue={empresa.logo || ""}
            placeholder="https://..."
          />

          <Input
            name="slug"
            label="Slug (identificador URL)"
            defaultValue={empresa.slug}
            disabled
          />

          <Button type="submit" disabled={isPending}>
            {isPending ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

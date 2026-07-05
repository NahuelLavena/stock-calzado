import { notFound } from "next/navigation";
import Link from "next/link";
import { getMovimientoPorId } from "../../actions";
import { EditarMovimientoForm } from "./editar-movimiento-form";

export default async function EditarMovimientoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const movimiento = await getMovimientoPorId(id);

  if (!movimiento) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link
          href={`/dashboard/movimientos/${movimiento.id}`}
          className="text-sm text-indigo-600 hover:underline"
        >
          ← Volver al movimiento
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          Editar Movimiento
        </h1>
      </div>

      <EditarMovimientoForm movimiento={movimiento} />
    </div>
  );
}

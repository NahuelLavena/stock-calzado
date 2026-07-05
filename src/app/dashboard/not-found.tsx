import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-semibold text-gray-900">
        Página no encontrada
      </h2>
      <p className="text-sm text-gray-500">
        La página que buscás no existe.
      </p>
      <Link href="/dashboard">
        <Button variant="secondary">Volver al inicio</Button>
      </Link>
    </div>
  );
}

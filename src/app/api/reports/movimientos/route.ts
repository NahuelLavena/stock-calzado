import { NextRequest, NextResponse } from "next/server";
import { getUsuarioActual } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { tipoLabels } from "@/lib/constants";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export async function GET(request: NextRequest) {
  try {
    const usuario = await getUsuarioActual();
    if (!usuario) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

  const { searchParams } = new URL(request.url);
  const fechaDesde = searchParams.get("fechaDesde") || "";
  const fechaHasta = searchParams.get("fechaHasta") || "";
  const tipo = searchParams.get("tipo") || "";

  const where: Record<string, unknown> = {
    usuario: { empresaId: usuario.empresaId },
  };

  if (tipo) where.tipo = tipo;

  if (fechaDesde || fechaHasta) {
    where.createdAt = {};
    if (fechaDesde) {
      (where.createdAt as Record<string, unknown>).gte = new Date(fechaDesde);
    }
    if (fechaHasta) {
      const hasta = new Date(fechaHasta);
      hasta.setHours(23, 59, 59, 999);
      (where.createdAt as Record<string, unknown>).lte = hasta;
    }
  }

  const movimientos = await prisma.movimiento.findMany({
    where,
    include: {
      usuario: { select: { nombre: true } },
      tallaje: {
        include: { producto: { select: { nombre: true, sku: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10000,
  });

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(18);
  doc.text(usuario.empresa.nombre, 14, 20);
  doc.setFontSize(12);
  doc.text("Reporte de Movimientos", 14, 28);
  doc.setFontSize(9);
  doc.setTextColor(120);

  const filtersApplied: string[] = [];
  if (tipo) filtersApplied.push(`Tipo: ${tipoLabels[tipo] || tipo}`);
  if (fechaDesde) filtersApplied.push(`Desde: ${fechaDesde}`);
  if (fechaHasta) filtersApplied.push(`Hasta: ${fechaHasta}`);
  filtersApplied.push(
    `Generado: ${new Date().toLocaleDateString("es-AR")} ${new Date().toLocaleTimeString("es-AR")}`
  );
  doc.text(filtersApplied.join(" | "), 14, 34);
  doc.setTextColor(0);

  const rows = movimientos.map((m) => [
    new Date(m.createdAt).toLocaleDateString("es-AR"),
    tipoLabels[m.tipo] || m.tipo,
    m.tallaje.producto.nombre,
    `${m.tallaje.talla} / ${m.tallaje.color}`,
    String(m.cantidad),
    m.usuario.nombre,
    m.motivo || "-",
  ]);

  let totalEntradas = 0;
  let totalSalidas = 0;
  for (const m of movimientos) {
    if (m.tipo === "ENTRADA" || m.tipo === "DEVOLUCION" || m.tipo === "AJUSTE_POS") {
      totalEntradas += m.cantidad;
    } else {
      totalSalidas += m.cantidad;
    }
  }

  autoTable(doc, {
    startY: 40,
    head: [["Fecha", "Tipo", "Producto", "Talla/Color", "Cant.", "Usuario", "Motivo"]],
    body: rows,
    styles: { fontSize: 7 },
    headStyles: { fillColor: [79, 70, 229] },
    columnStyles: { 4: { halign: "right" } },
  });

  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.text(`Total movimientos: ${movimientos.length}`, 14, finalY);
  doc.text(`Entradas: ${totalEntradas}`, 14, finalY + 6);
  doc.text(`Salidas: ${totalSalidas}`, 14, finalY + 12);

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth - 14,
      doc.internal.pageSize.getHeight() - 10,
      { align: "right" }
    );
  }

  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="movimientos_${new Date().toISOString().split("T")[0]}.pdf"`,
    },
  });
  } catch {
    return NextResponse.json({ error: "Error generando reporte" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getUsuarioActual } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { tipoLabels } from "@/lib/constants";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export async function GET() {
  try {
    const usuario = await getUsuarioActual();
    if (!usuario) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

  const empresaId = usuario.empresaId;
  const now = new Date();
  const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalProductos, totalStock, movimientosMes, stockBajo, ultimosMovimientos, entradasMes, salidasMes] =
    await Promise.all([
      prisma.producto.count({ where: { empresaId, activo: true } }),
      prisma.tallaje.aggregate({
        where: { producto: { empresaId, activo: true } },
        _sum: { stock: true },
      }),
      prisma.movimiento.count({
        where: { usuario: { empresaId }, createdAt: { gte: inicioMes } },
      }),
      prisma.tallaje.findMany({
        where: { stock: { lte: 5 }, producto: { empresaId, activo: true } },
        include: { producto: { select: { nombre: true, sku: true } } },
        take: 10,
      }),
      prisma.movimiento.findMany({
        where: { usuario: { empresaId } },
        include: {
          usuario: { select: { nombre: true } },
          tallaje: { include: { producto: { select: { nombre: true } } } },
        },
        orderBy: { createdAt: "desc" },
        take: 15,
      }),
      prisma.movimiento.aggregate({
        where: {
          usuario: { empresaId },
          tipo: { in: ["ENTRADA", "DEVOLUCION"] },
          createdAt: { gte: inicioMes },
        },
        _sum: { cantidad: true },
      }),
      prisma.movimiento.aggregate({
        where: {
          usuario: { empresaId },
          tipo: { in: ["SALIDA", "AJUSTE_NEG"] },
          createdAt: { gte: inicioMes },
        },
        _sum: { cantidad: true },
      }),
    ]);

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  doc.setFontSize(20);
  doc.text(usuario.empresa.nombre, 14, y);
  y += 10;
  doc.setFontSize(14);
  doc.text("Reporte Ejecutivo", 14, y);
  y += 8;
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(
    `Generado: ${new Date().toLocaleDateString("es-AR")} ${new Date().toLocaleTimeString("es-AR")}`,
    14,
    y
  );
  doc.setTextColor(0);
  y += 14;

  doc.setFontSize(12);
  doc.text("Resumen", 14, y);
  y += 8;

  autoTable(doc, {
    startY: y,
    head: [["Métrica", "Valor"]],
    body: [
      ["Productos activos", String(totalProductos)],
      ["Stock total", String(totalStock._sum.stock ?? 0)],
      ["Movimientos este mes", String(movimientosMes)],
      ["Entradas este mes", `+${String(entradasMes._sum.cantidad ?? 0)}`],
      ["Salidas este mes", `-${String(salidasMes._sum.cantidad ?? 0)}`],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [79, 70, 229] },
    theme: "grid",
  });

  y =
    (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
      .finalY + 12;

  if (stockBajo.length > 0) {
    doc.setFontSize(12);
    doc.text("Alertas de Stock Bajo", 14, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [["SKU", "Producto", "Talla", "Color", "Stock", "Mín."]],
      body: stockBajo.map((t) => [
        t.producto.sku,
        t.producto.nombre,
        t.talla,
        t.color,
        String(t.stock),
        String(t.stockMinimo),
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [225, 29, 72] },
      didParseCell(data) {
        if (data.section === "body" && data.column.index === 4) {
          const stock = Number(data.cell.raw);
          if (stock === 0) {
            data.cell.styles.textColor = [225, 29, 72];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
    });

    y =
      (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
        .finalY + 12;
  }

  doc.setFontSize(12);
  doc.text("Últimos Movimientos", 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [["Fecha", "Tipo", "Producto", "Talla/Color", "Cant.", "Usuario"]],
    body: ultimosMovimientos.map((m) => [
      new Date(m.createdAt).toLocaleDateString("es-AR"),
      tipoLabels[m.tipo] || m.tipo,
      m.tallaje.producto.nombre,
      `${m.tallaje.talla} / ${m.tallaje.color}`,
      String(m.cantidad),
      m.usuario.nombre,
    ]),
    styles: { fontSize: 7 },
    headStyles: { fillColor: [79, 70, 229] },
  });

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
      "Content-Disposition": `attachment; filename="reporte_ejecutivo_${new Date().toISOString().split("T")[0]}.pdf"`,
    },
  });
  } catch {
    return NextResponse.json({ error: "Error generando reporte" }, { status: 500 });
  }
}

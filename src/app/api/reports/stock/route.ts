import { NextResponse } from "next/server";
import { getUsuarioActual } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export async function GET() {
  try {
    const usuario = await getUsuarioActual();
    if (!usuario) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

  const productos = await prisma.producto.findMany({
    where: { empresaId: usuario.empresaId, activo: true },
    include: { tallas: { orderBy: { talla: "asc" } } },
    orderBy: { nombre: "asc" },
    take: 5000,
  });

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(18);
  doc.text(usuario.empresa.nombre, 14, 20);
  doc.setFontSize(12);
  doc.text("Reporte de Stock", 14, 28);
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(
    `Generado: ${new Date().toLocaleDateString("es-AR")} ${new Date().toLocaleTimeString("es-AR")}`,
    14,
    34
  );
  doc.setTextColor(0);

  const rows: string[][] = [];
  let totalStock = 0;
  let stockBajo = 0;

  for (const p of productos) {
    for (const t of p.tallas) {
      totalStock += t.stock;
      if (t.stock <= t.stockMinimo) stockBajo++;
      rows.push([
        p.sku,
        p.nombre,
        p.marca,
        t.talla,
        t.color,
        String(t.stock),
        String(t.stockMinimo),
        t.stock <= t.stockMinimo ? "BAJO" : "OK",
      ]);
    }
  }

  autoTable(doc, {
    startY: 40,
    head: [["SKU", "Producto", "Marca", "Talla", "Color", "Stock", "Mín.", "Estado"]],
    body: rows,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [79, 70, 229] },
    columnStyles: {
      5: { halign: "right" },
      6: { halign: "right" },
    },
    didParseCell(data) {
      if (data.section === "body" && data.column.index === 7) {
        if (data.cell.raw === "BAJO") {
          data.cell.styles.textColor = [225, 29, 72];
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
  });

  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.text(`Total productos activos: ${productos.length}`, 14, finalY);
  doc.text(`Total unidades en stock: ${totalStock}`, 14, finalY + 6);
  doc.text(`Productos con stock bajo: ${stockBajo}`, 14, finalY + 12);

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
      "Content-Disposition": `attachment; filename="stock_${new Date().toISOString().split("T")[0]}.pdf"`,
    },
  });
  } catch {
    return NextResponse.json({ error: "Error generando reporte" }, { status: 500 });
  }
}

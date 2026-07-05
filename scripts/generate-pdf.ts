import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import fs from "fs";
import path from "path";

const INDIGO = [79, 70, 229] as const;
const SLATE = [51, 65, 85] as const;

const doc = new jsPDF();
const pageWidth = doc.internal.pageSize.getWidth();
const pageHeight = doc.internal.pageSize.getHeight();
const margin = 14;
let y = 0;

function addPage() {
  doc.addPage();
  y = 20;
}

function addFooter(pageNum: number, total: number) {
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(
    `Stock Calzado — Página ${pageNum} de ${total}`,
    pageWidth - margin,
    pageHeight - 10,
    { align: "right" }
  );
}

function checkPageBreak(needed: number) {
  if (y + needed > pageHeight - 25) {
    addPage();
  }
}

function sectionTitle(text: string) {
  checkPageBreak(18);
  doc.setFontSize(16);
  doc.setTextColor(...INDIGO);
  doc.text(text, margin, y);
  y += 3;
  doc.setDrawColor(...INDIGO);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;
}

function subTitle(text: string) {
  checkPageBreak(12);
  doc.setFontSize(12);
  doc.setTextColor(...SLATE);
  doc.text(text, margin, y);
  y += 7;
}

function bodyText(text: string) {
  checkPageBreak(8);
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
  doc.text(lines, margin, y);
  y += lines.length * 5 + 2;
}

function bullet(text: string) {
  checkPageBreak(8);
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text("\u2022", margin + 2, y);
  const lines = doc.splitTextToSize(text, pageWidth - margin * 2 - 8);
  doc.text(lines, margin + 8, y);
  y += lines.length * 5 + 2;
}

function spacer(pts: number) {
  y += pts;
}

// ─── PORTADA ────────────────────────────────────────────
doc.setFillColor(...INDIGO);
doc.rect(0, 0, pageWidth, pageHeight, "F");

doc.setTextColor(255, 255, 255);
doc.setFontSize(36);
doc.text("Stock Calzado", pageWidth / 2, 80, { align: "center" });

doc.setFontSize(16);
doc.text(
  "Sistema de Gesti\u00f3n de Inventario para Negocios de Calzado",
  pageWidth / 2,
  95,
  { align: "center" }
);

doc.setFontSize(11);
doc.text(
  "Control\u00e1 tu stock por talle, color y modelo.",
  pageWidth / 2,
  115,
  { align: "center" }
);
doc.text(
  "Reportes, alertas, trabajo offline y m\u00e1s.",
  pageWidth / 2,
  123,
  { align: "center" }
);

doc.setFontSize(9);
doc.setTextColor(200, 200, 255);
doc.text(
  `Documento generado: ${new Date().toLocaleDateString("es-AR")}`,
  pageWidth / 2,
  pageHeight - 20,
  { align: "center" }
);

addPage();

// ─── EL PROBLEMA ────────────────────────────────────────
sectionTitle("El Problema");

bodyText(
  "Los negocios de calzado enfrentan desaf\u00edos \u00fanicos que las soluciones gen\u00e9ricas de inventario no resuelven:"
);

bullet(
  "Cada modelo de zapato tiene m\u00faltiples talles y colores, y controlar el stock de cada combinaci\u00f3n manualmente es propenso a errores."
);
bullet(
  "Cuando el stock de un talle espec\u00edfico se agota, no hay forma autom\u00e1tica de detectarlo hasta que un cliente lo solicita y se pierde la venta."
);
bullet(
  "Los movimientos de entrada, salida, ajustes y devoluciones se registran en libretas o planillas que no se actualizan en tiempo real."
);
bullet(
  "No hay reportes claros para saber qu\u00e9 productos se est\u00e1n vendiendo, cu\u00e1les est\u00e1n estancados y cu\u00e1nto stock queda en total."
);
bullet(
  "En dep\u00f3sitos o sucursales con mala conectividad, los sistemas tradicionales dejan de funcionar y se pierde informaci\u00f3n."
);

spacer(5);
bodyText(
  "Resultado: p\u00e9rdidas de stock, ventas perdidas, decisiones a ciegas y horas gastadas en tareas manuales que deber\u00edan ser autom\u00e1ticas."
);

// ─── LA SOLUCI\u00d3N ────────────────────────────────────────
addPage();
sectionTitle("La Soluci\u00f3n");

doc.setFontSize(13);
doc.setTextColor(...INDIGO);
doc.text("Stock Calzado", margin, y);
y += 7;

bodyText(
  "Stock Calzado es un sistema de gesti\u00f3n de inventario dise\u00f1ado espec\u00edficamente para el rubro del calzado. Permite controlar el stock de cada producto por SKU, marca, modelo, categor\u00eda, talle y color \u2014 todo desde una interfaz moderna, r\u00e1pida y f\u00e1cil de usar."
);

spacer(3);
subTitle("\u00bfQu\u00e9 lo hace diferente?");

bullet(
  "Enfoque en calzado: No es un sistema gen\u00e9rico. Est\u00e1 pensado para manejar la complejidad de talles y colores que tiene cada modelo de zapato."
);
bullet(
  "Funciona sin internet: Modo offline con sincronizaci\u00f3n autom\u00e1tica. Ideal para dep\u00f3sitos y zonas con mala conectividad."
);
bullet(
  "Reportes profesionales: Gener\u00e1 reportes ejecutivos, de stock y de movimientos en PDF con un clic."
);
bullet(
  "Multi-usuario con permisos: Cada empleado tiene su rol y permisos espec\u00edficos. El due\u00f1o controla todo."
);
bullet(
  "Alertas autom\u00e1ticas: Se notifica cuando el stock de un producto baja del m\u00ednimo configurado."
);

// ─── M\u00d3DULOS PRINCIPALES ───────────────────────────────
addPage();
sectionTitle("M\u00f3dulos Principales");

subTitle("Dashboard");
bodyText(
  "La pantalla principal muestra un resumen completo del negocio en tiempo real: cantidad de productos activos, stock total, movimientos del mes, alertas de stock bajo, gr\u00e1fico de entradas y salidas de los \u00faltimos 30 d\u00edas, y la actividad reciente. Incluye accesos r\u00e1pidos para crear productos, registrar movimientos y generar reportes."
);

subTitle("Gesti\u00f3n de Productos");
bodyText(
  "ABM completo de productos con SKU, nombre, marca, modelo, categor\u00eda (Zapatillas, Botas, Sandalias, Zapatos, Deportivos, Otros), precio y descripci\u00f3n. Cada producto tiene m\u00faltiples combinaciones de talle y color, cada una con su propio stock y stock m\u00ednimo configurable. Se puede buscar, filtrar, paginar, exportar a CSV y generar reportes PDF."
);

subTitle("Movimientos de Stock");
bodyText(
  "Registro de todos los movimientos que afectan el inventario. Cinco tipos de movimiento:"
);

bullet("Entrada \u2014 Carga de mercader\u00eda nueva (compras a proveedores)");
bullet("Salida \u2014 Ventas (en local, online, mayorista)");
bullet("Ajuste Positivo \u2014 Correcci\u00f3n de inventario por sobrante");
bullet("Ajuste Negativo \u2014 Correcci\u00f3n por da\u00f1o, extrav\u00edo o vencimiento");
bullet("Devoluci\u00f3n \u2014 Devoluci\u00f3n de un cliente");

bodyText(
  "Cada movimiento registra fecha, tipo, cantidad, producto, talle/color, usuario responsable y motivo opcional. El stock se actualiza autom\u00e1ticamente en una transacci\u00f3n at\u00f3mica."
);

subTitle("Usuarios");
bodyText(
  "Gesti\u00f3n de usuarios con tres roles: Administrador (control total), Vendedor (consulta y movimientos si tiene permiso) y Almacenero (consulta y movimientos si tiene permiso). Cada usuario tiene un toggle independiente de permiso de edici\u00f3n de stock."
);

subTitle("Configuraci\u00f3n");
bodyText(
  "Panel de administraci\u00f3n para editar el nombre de la empresa, configurar el logo y gestionar la cuenta. Solo accesible por administradores."
);

// ─── GESTI\u00d3N DE STOCK ──────────────────────────────────
addPage();
sectionTitle("Gesti\u00f3n de Stock");

bodyText(
  "El coraz\u00f3n del sistema es la gesti\u00f3n de stock a nivel de talle y color. Cada producto puede tener m\u00faltiples combinaciones, cada una con:"
);

bullet("Talla (num\u00e9rica o string: 38, 39, 40, S, M, L, etc.)");
bullet("Color (cualquier valor: Negro, Blanco, Rojo, Azul marino, etc.)");
bullet("Stock actual (cantidad disponible)");
bullet("Stock m\u00ednimo (umbral para alertas autom\u00e1ticas)");

spacer(3);
subTitle("Flujo de Stock");

bodyText(
  "Cuando se registra una Entrada o Devoluci\u00f3n, el stock aumenta. Cuando se registra una Salida o Ajuste Negativo, el stock disminuye. Si el stock resultante queda por debajo del stock m\u00ednimo, el sistema genera autom\u00e1ticamente una notificaci\u00f3n de alerta para la empresa."
);

bodyText(
  "Editar o eliminar un movimiento revierte los cambios de stock de forma at\u00f3mica, asegurando la integridad de los datos en todo momento."
);

spacer(3);
subTitle("Alertas de Stock Bajo");

bodyText(
  "El sistema monitorea continuamente los niveles de stock. Cuando un producto baja del m\u00ednimo configurado, se genera una notificaci\u00f3n con el SKU, nombre, talle, color y stock actual. Las notificaciones se agrupan en el header de la app con un contador de pendientes y se pueden marcar como le\u00eddas."
);

// ─── REPORTES PDF ──────────────────────────────────────
addPage();
sectionTitle("Reportes PDF");

bodyText(
  "Stock Calzado genera tres tipos de reportes en formato PDF, listos para imprimir o enviar:"
);

spacer(3);
subTitle("1. Reporte Ejecutivo");
bodyText(
  "Resumen para toma de decisiones: tabla de KPIs (productos activos, stock total, movimientos del mes, entradas, salidas), alertas de stock bajo con los 10 productos m\u00e1s cr\u00edticos, y los \u00faltimos 15 movimientos con fecha, tipo, producto, cantidad y usuario."
);

subTitle("2. Reporte de Stock");
bodyText(
  "Listado completo de todos los productos activos con cada combinaci\u00f3n de talle/color, stock actual, stock m\u00ednimo y estado (OK / BAJO / SIN STOCK). Incluye totales al final del reporte. Ideal para auditor\u00edas y conteos f\u00edsicos."
);

subTitle("3. Reportes de Movimientos");
bodyText(
  "Historial de movimientos filtrable por tipo y rango de fecha. Muestra cada movimiento con fecha, tipo, producto, talle/color, cantidad y usuario. Incluye subtotales por tipo de movimiento."
);

spacer(3);
bodyText(
  "Todos los reportes incluyen el nombre de la empresa, fecha y hora de generaci\u00f3n, y numeraci\u00f3n de p\u00e1ginas."
);

// ─── OFFLINE / PWA ─────────────────────────────────────
addPage();
sectionTitle("Modo Offline y PWA");

bodyText(
  "Stock Calzado es una Progressive Web App (PWA) que funciona completamente sin conexi\u00f3n a internet. Esta es una de sus principales ventajas competitivas."
);

spacer(3);
subTitle("\u00bfC\u00f3mo funciona?");

bullet(
  "Al acceder al dashboard, el sistema descarga todos los productos, talles y movimientos de la empresa a una base de datos local en el navegador (IndexedDB)."
);
bullet(
  "Mientras hay conexi\u00f3n, todo funciona normalmente contra el servidor."
);
bullet(
  "Cuando se pierde la conexi\u00f3n, la app sigue funcionando: se pueden ver productos, registrar movimientos, y navegar por los datos."
);
bullet(
  "Los movimientos creados offline se encolan autom\u00e1ticamente."
);
bullet(
  "Al recuperar la conexi\u00f3n, los cambios se sincronizan al servidor en segundo plano, con l\u00f3gica de reintento (hacer 3 intentos antes de marcar como fallido)."
);

spacer(3);
subTitle("Experiencia de Usuario Offline");

bullet("Banner amarillo visible: 'Sin conexi\u00f3n \u2014 Los cambios se sincronizar\u00e1n autom\u00e1ticamente'");
bullet("Indicador de sincronizaci\u00f3n en el header con contador de cambios pendientes");
bullet("P\u00e1gina dedicada de offline con bot\u00f3n de reintentar");
bullet("Formularios de creaci\u00f3n de movimientos funcionales sin internet");

// ─── SEGURIDAD Y ROLES ────────────────────────────────
addPage();
sectionTitle("Seguridad y Roles");

subTitle("Multi-Tenancy");
bodyText(
  "Cada empresa tiene su propio conjunto de datos completamente aislado. Un usuario nunca puede ver ni modificar datos de otra empresa. Todas las consultas a la base de datos est\u00e1n filtradas por empresaId."
);

subTitle("Roles y Permisos");

autoTable(doc, {
  startY: y,
  head: [["Acci\u00f3n", "Admin", "Vendedor / Almacenero"]],
  body: [
    ["Ver dashboard", "\u2713", "\u2713"],
    ["Ver productos", "\u2713", "\u2713"],
    ["Crear/editar/eliminar productos", "\u2713", "\u2014"],
    ["Registrar movimientos", "\u2713", "Solo con permiso"],
    ["Ver reportes PDF", "\u2713", "\u2014"],
    ["Exportar CSV", "\u2713", "\u2713"],
    ["Gestionar usuarios", "\u2713", "\u2014"],
    ["Configuraci\u00f3n empresa", "\u2713", "\u2014"],
  ],
  styles: { fontSize: 9 },
  headStyles: { fillColor: [...INDIGO] },
  alternateRowStyles: { fillColor: [248, 250, 252] },
  theme: "grid",
});

y =
  (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
    .finalY + 10;

subTitle("Seguridad T\u00e9cnica");

bullet("Autenticaci\u00f3n con Supabase Auth (JWT + refresh tokens)");
bullet("Rate limiting: 5 intentos/minuto en login, 30 req/minuto general");
bullet("Headers de seguridad: CSP, HSTS, X-Frame-Options DENY, X-XSS-Protection");
bullet("Validaci\u00f3n de datos con Zod en todos los formularios");
bullet("Contrase\u00f1as hasheadas con bcrypt (gestionadas por Supabase)");
bullet("Sesi\u00f3n refresh autom\u00e1tico en cada request");

// ─── TECNOLOG\u00cdA ────────────────────────────────────────
addPage();
sectionTitle("Tecnolog\u00eda");

bodyText(
  "Stock Calzado est\u00e1 construido con tecnolog\u00eda moderna y de vanguardia:"
);

spacer(3);

autoTable(doc, {
  startY: y,
  head: [["Capa", "Tecnolog\u00eda", "Versi\u00f3n"]],
  body: [
    ["Framework", "Next.js (App Router)", "16.x"],
    ["Lenguaje", "TypeScript", "5.x"],
    ["UI", "React", "19.x"],
    ["Estilos", "Tailwind CSS", "v4"],
    ["Base de datos", "PostgreSQL (Supabase)", "\u2014"],
    ["ORM", "Prisma", "7.x"],
    ["Autenticaci\u00f3n", "Supabase Auth (SSR)", "0.12"],
    ["Offline", "Dexie (IndexedDB) + Serwist", "4.x / 9.x"],
    ["Reportes", "jsPDF + jspdf-autotable", "4.x / 5.x"],
    ["Validaci\u00f3n", "Zod", "4.x"],
  ],
  styles: { fontSize: 9 },
  headStyles: { fillColor: [...INDIGO] },
  alternateRowStyles: { fillColor: [248, 250, 252] },
  theme: "grid",
});

y =
  (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
    .finalY + 10;

subTitle("Deployment");
bodyText(
  "La aplicaci\u00f3n est\u00e1 dise\u00f1ada para desplegarse en Vercel (o cualquier plataforma compatible con Next.js). La base de datos se hostea en Supabase con connection pooling para alto rendimiento. El deploy es autom\u00e1tico-push a producci\u00f3n."
);

subTitle("Dise\u00f1o Responsive");
bodyText(
  "La interfaz se adapta a desktop, tablet y m\u00f3vil. En dispositivos m\u00f3viles, el sidebar se colapsa en un men\u00fa hamburguesa, las tablas se convierten en tarjetas, y todos los formularios son completamente funcionales en pantallas peque\u00f1as."
);

// ─── PR\u00d3XIMAMENTE ──────────────────────────────────────
addPage();
sectionTitle("Pr\u00f3ximamente");

bodyText(
  "El sistema est\u00e1 en constante evoluci\u00f3n. Las pr\u00f3ximas funcionalidades en el roadmap incluyen:"
);

bullet("Notificaciones por email para alertas de stock bajo");
bullet("API p\u00fablica para integraciones con otros sistemas (POS, e-commerce)");
bullet("Gr\u00e1ficos interactivos con filtros por per\u00edodo y producto");
bullet("Soporte multi-idioma (i18n) para mercados internacionales");
bullet("Modo oscuro");
bullet("App m\u00f3vil nativa");

spacer(10);

// ─── CIERRE ────────────────────────────────────────────
doc.setFillColor(...INDIGO);
doc.roundedRect(margin, y, pageWidth - margin * 2, 40, 3, 3, "F");

doc.setTextColor(255, 255, 255);
doc.setFontSize(14);
doc.text(
  "\u00bfListo para gestionar tu calzado de forma inteligente?",
  pageWidth / 2,
  y + 15,
  { align: "center" }
);
doc.setFontSize(10);
doc.text(
  "Stock Calzado \u2014 La soluci\u00f3n que tu negocio necesita.",
  pageWidth / 2,
  y + 25,
  { align: "center" }
);

// ─── FOOTERS ───────────────────────────────────────────
const totalPages = doc.getNumberOfPages();
for (let i = 1; i <= totalPages; i++) {
  doc.setPage(i);
  addFooter(i, totalPages);
}

// ─── SAVE ──────────────────────────────────────────────
const outputDir = path.join(process.cwd(), "docs");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputPath = path.join(outputDir, "stock-calzado-venta.pdf");
doc.save(outputPath);
console.log(`PDF generado: ${outputPath}`);
console.log(`Páginas: ${totalPages}`);

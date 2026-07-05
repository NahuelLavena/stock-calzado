import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { MANAGED_BY_SUPABASE } from "../src/lib/constants";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================
// DATOS DE EJEMPLO
// ============================

const EMPRESA_NOMBRE = "Zapatería El Paso";
const EMPRESA_SLUG = "zapateria-el-paso";

const USUARIOS = [
  {
    email: "admin@zapateriaelpaso.com",
    password: "admin123",
    nombre: "Carlos Admin",
    rol: "ADMIN" as const,
    puedeEditarStock: true,
  },
  {
    email: "vendedor@zapateriaelpaso.com",
    password: "vendedor123",
    nombre: "María Vendedora",
    rol: "VENDEDOR" as const,
    puedeEditarStock: false,
  },
  {
    email: "almacenero@zapateriaelpaso.com",
    password: "almacenero123",
    nombre: "Juan Almacenero",
    rol: "ALMACENERO" as const,
    puedeEditarStock: true,
  },
];

const PRODUCTOS = [
  {
    sku: "NIKE-AIR-MAX-90",
    nombre: "Nike Air Max 90",
    marca: "Nike",
    modelo: "Air Max 90",
    categoria: "HOMBRES" as const,
    descripcion: "Zapatilla clásica con amortiguación Air visible.",
    tallas: [
      { talla: "38", color: "Negro", stock: 10, stockMinimo: 5, precioEfectivo: 129.99, precioTransferencia: 119.99 },
      { talla: "39", color: "Negro", stock: 15, stockMinimo: 5, precioEfectivo: 129.99, precioTransferencia: 119.99 },
      { talla: "40", color: "Negro", stock: 8, stockMinimo: 5, precioEfectivo: 129.99, precioTransferencia: 119.99 },
      { talla: "41", color: "Negro", stock: 12, stockMinimo: 5, precioEfectivo: 129.99, precioTransferencia: 119.99 },
      { talla: "42", color: "Blanco", stock: 6, stockMinimo: 3, precioEfectivo: 129.99, precioTransferencia: 119.99 },
    ],
  },
  {
    sku: "ADIDAS-OZWEEGO",
    nombre: "Adidas Ozweego",
    marca: "Adidas",
    modelo: "Ozweego",
    categoria: "MUJER" as const,
    descripcion: "Diseño retro con tecnología de amortiguación moderna.",
    tallas: [
      { talla: "39", color: "Blanco", stock: 7, stockMinimo: 4, precioEfectivo: 109.99, precioTransferencia: 99.99 },
      { talla: "40", color: "Blanco", stock: 11, stockMinimo: 4, precioEfectivo: 109.99, precioTransferencia: 99.99 },
      { talla: "41", color: "Blanco", stock: 9, stockMinimo: 4, precioEfectivo: 109.99, precioTransferencia: 99.99 },
      { talla: "42", color: "Gris", stock: 4, stockMinimo: 3, precioEfectivo: 109.99, precioTransferencia: 99.99 },
    ],
  },
  {
    sku: "NB-574-CLASSIC",
    nombre: "New Balance 574 Classic",
    marca: "New Balance",
    modelo: "574",
    categoria: "URBANAS" as const,
    descripcion: "Estilo retro icónico de New Balance.",
    tallas: [
      { talla: "39", color: "Gris", stock: 12, stockMinimo: 5, precioEfectivo: 99.99, precioTransferencia: 89.99 },
      { talla: "40", color: "Gris", stock: 10, stockMinimo: 5, precioEfectivo: 99.99, precioTransferencia: 89.99 },
      { talla: "41", color: "Azul", stock: 8, stockMinimo: 4, precioEfectivo: 99.99, precioTransferencia: 89.99 },
      { talla: "42", color: "Azul", stock: 6, stockMinimo: 3, precioEfectivo: 99.99, precioTransferencia: 89.99 },
    ],
  },
  {
    sku: "CONVERSE-CHUCK",
    nombre: "Converse Chuck Taylor",
    marca: "Converse",
    modelo: "Chuck Taylor All Star",
    categoria: "JUVENIL" as const,
    descripcion: "La zapatilla más icónica del mundo.",
    tallas: [
      { talla: "37", color: "Negro", stock: 14, stockMinimo: 5, precioEfectivo: 79.99, precioTransferencia: 69.99 },
      { talla: "38", color: "Negro", stock: 16, stockMinimo: 5, precioEfectivo: 79.99, precioTransferencia: 69.99 },
      { talla: "39", color: "Blanco", stock: 11, stockMinimo: 5, precioEfectivo: 79.99, precioTransferencia: 69.99 },
      { talla: "40", color: "Blanco", stock: 9, stockMinimo: 4, precioEfectivo: 79.99, precioTransferencia: 69.99 },
      { talla: "41", color: "Rojo", stock: 5, stockMinimo: 3, precioEfectivo: 79.99, precioTransferencia: 69.99 },
    ],
  },
  {
    sku: "TIMBERLAND-6IN",
    nombre: "Timberland 6 Inch Premium",
    marca: "Timberland",
    modelo: "6 Inch Premium",
    categoria: "BOTINES" as const,
    descripcion: "Bota resistente al agua, clásica de trabajo.",
    tallas: [
      { talla: "40", color: "Marrón", stock: 5, stockMinimo: 3, precioEfectivo: 189.99, precioTransferencia: 179.99 },
      { talla: "41", color: "Marrón", stock: 8, stockMinimo: 3, precioEfectivo: 189.99, precioTransferencia: 179.99 },
      { talla: "42", color: "Marrón", stock: 6, stockMinimo: 3, precioEfectivo: 189.99, precioTransferencia: 179.99 },
      { talla: "43", color: "Marrón", stock: 3, stockMinimo: 2, precioEfectivo: 189.99, precioTransferencia: 179.99 },
    ],
  },
  {
    sku: "DR-MARTENS-1460",
    nombre: "Dr. Martens 1460",
    marca: "Dr. Martens",
    modelo: "1460",
    categoria: "BOTINES" as const,
    descripcion: "Bota de cuero con suela air-cushioned.",
    tallas: [
      { talla: "39", color: "Negro", stock: 4, stockMinimo: 3, precioEfectivo: 169.99, precioTransferencia: 159.99 },
      { talla: "40", color: "Negro", stock: 7, stockMinimo: 3, precioEfectivo: 169.99, precioTransferencia: 159.99 },
      { talla: "41", color: "Negro", stock: 5, stockMinimo: 3, precioEfectivo: 169.99, precioTransferencia: 159.99 },
      { talla: "42", color: "Cereza", stock: 3, stockMinimo: 2, precioEfectivo: 169.99, precioTransferencia: 159.99 },
    ],
  },
  {
    sku: "BIRKENSTOCK-AZ",
    nombre: "Birkenstock Arizona",
    marca: "Birkenstock",
    modelo: "Arizona",
    categoria: "OJOTAS" as const,
    descripcion: "Sandalia con plantilla de corcho anatómica.",
    tallas: [
      { talla: "38", color: "Marrón", stock: 10, stockMinimo: 4, precioEfectivo: 89.99, precioTransferencia: 79.99 },
      { talla: "39", color: "Marrón", stock: 12, stockMinimo: 4, precioEfectivo: 89.99, precioTransferencia: 79.99 },
      { talla: "40", color: "Negro", stock: 8, stockMinimo: 4, precioEfectivo: 89.99, precioTransferencia: 79.99 },
      { talla: "41", color: "Negro", stock: 6, stockMinimo: 3, precioEfectivo: 89.99, precioTransferencia: 79.99 },
    ],
  },
  {
    sku: "ADIDAS-ADILETTE",
    nombre: "Adidas Adilette",
    marca: "Adidas",
    modelo: "Adilette",
    categoria: "OJOTAS" as const,
    descripcion: "Ojota clásica para playa y pileta.",
    tallas: [
      { talla: "38", color: "Azul", stock: 20, stockMinimo: 8, precioEfectivo: 39.99, precioTransferencia: 34.99 },
      { talla: "39", color: "Azul", stock: 18, stockMinimo: 8, precioEfectivo: 39.99, precioTransferencia: 34.99 },
      { talla: "40", color: "Negro", stock: 15, stockMinimo: 6, precioEfectivo: 39.99, precioTransferencia: 34.99 },
      { talla: "41", color: "Negro", stock: 12, stockMinimo: 5, precioEfectivo: 39.99, precioTransferencia: 34.99 },
      { talla: "42", color: "Blanco", stock: 9, stockMinimo: 4, precioEfectivo: 39.99, precioTransferencia: 34.99 },
    ],
  },
  {
    sku: "CLARKS-DESERT",
    nombre: "Clarks Desert Boot",
    marca: "Clarks",
    modelo: "Desert Boot",
    categoria: "HOMBRES" as const,
    descripcion: "Zapato casual con suela de crepe.",
    tallas: [
      { talla: "40", color: "Marrón", stock: 4, stockMinimo: 2, precioEfectivo: 139.99, precioTransferencia: 129.99 },
      { talla: "41", color: "Marrón", stock: 6, stockMinimo: 3, precioEfectivo: 139.99, precioTransferencia: 129.99 },
      { talla: "42", color: "Negro", stock: 5, stockMinimo: 3, precioEfectivo: 139.99, precioTransferencia: 129.99 },
      { talla: "43", color: "Negro", stock: 2, stockMinimo: 2, precioEfectivo: 139.99, precioTransferencia: 129.99 },
    ],
  },
  {
    sku: "FLUCHOS-VENECIA",
    nombre: "Fluchos Venecia",
    marca: "Fluchos",
    modelo: "Venecia",
    categoria: "HOMBRES" as const,
    descripcion: "Zapato casual argentino de vestir.",
    tallas: [
      { talla: "39", color: "Negro", stock: 8, stockMinimo: 4, precioEfectivo: 59.99, precioTransferencia: 54.99 },
      { talla: "40", color: "Negro", stock: 10, stockMinimo: 4, precioEfectivo: 59.99, precioTransferencia: 54.99 },
      { talla: "41", color: "Marrón", stock: 7, stockMinimo: 3, precioEfectivo: 59.99, precioTransferencia: 54.99 },
      { talla: "42", color: "Marrón", stock: 5, stockMinimo: 3, precioEfectivo: 59.99, precioTransferencia: 54.99 },
    ],
  },
  {
    sku: "NIKE-REVOLUTION",
    nombre: "Nike Revolution 6",
    marca: "Nike",
    modelo: "Revolution 6",
    categoria: "MUJER" as const,
    descripcion: "Zapatilla de running para principiantes.",
    tallas: [
      { talla: "39", color: "Negro", stock: 14, stockMinimo: 5, precioEfectivo: 69.99, precioTransferencia: 64.99 },
      { talla: "40", color: "Negro", stock: 12, stockMinimo: 5, precioEfectivo: 69.99, precioTransferencia: 64.99 },
      { talla: "41", color: "Gris", stock: 9, stockMinimo: 4, precioEfectivo: 69.99, precioTransferencia: 64.99 },
      { talla: "42", color: "Gris", stock: 7, stockMinimo: 3, precioEfectivo: 69.99, precioTransferencia: 64.99 },
    ],
  },
  {
    sku: "CROCS-CLASSIC",
    nombre: "Crocs Classic Clog",
    marca: "Crocs",
    modelo: "Classic Clog",
    categoria: "PANTUFLAS" as const,
    descripcion: "Zueco cómodo y liviano para uso casual.",
    tallas: [
      { talla: "38", color: "Verde", stock: 16, stockMinimo: 6, precioEfectivo: 49.99, precioTransferencia: 44.99 },
      { talla: "39", color: "Verde", stock: 14, stockMinimo: 6, precioEfectivo: 49.99, precioTransferencia: 44.99 },
      { talla: "40", color: "Azul", stock: 11, stockMinimo: 5, precioEfectivo: 49.99, precioTransferencia: 44.99 },
      { talla: "41", color: "Azul", stock: 8, stockMinimo: 4, precioEfectivo: 49.99, precioTransferencia: 44.99 },
      { talla: "42", color: "Negro", stock: 10, stockMinimo: 4, precioEfectivo: 49.99, precioTransferencia: 44.99 },
    ],
  },
];

// ============================
// FUNCIONES AUXILIARES
// ============================

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(daysAgo: number): Date {
  const now = new Date();
  const past = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return new Date(
    past.getTime() + Math.random() * (now.getTime() - past.getTime())
  );
}

// ============================
// MAIN
// ============================

async function main() {
  console.log("🌱 Iniciando seed...\n");

  // 1. Crear empresa
  const empresa = await prisma.empresa.upsert({
    where: { slug: EMPRESA_SLUG },
    update: {},
    create: {
      nombre: EMPRESA_NOMBRE,
      slug: EMPRESA_SLUG,
    },
  });
  console.log(`✅ Empresa: ${empresa.nombre}`);

  // 2. Crear usuarios via Supabase Auth
  const usuariosCreados = [];

  for (const userData of USUARIOS) {
    // Crear en Supabase Auth
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: { nombre: userData.nombre },
      });

    if (authError && !authError.message.includes("already")) {
      console.error(`❌ Error creando Auth user ${userData.email}:`, authError.message);
      continue;
    }

    // Obtener o crear usuario en DB
    let usuario = await prisma.usuario.findUnique({
      where: { email: userData.email },
    });

    if (!usuario) {
      usuario = await prisma.usuario.create({
        data: {
          email: userData.email,
          nombre: userData.nombre,
          passwordHash: MANAGED_BY_SUPABASE,
          rol: userData.rol,
          puedeEditarStock: userData.puedeEditarStock,
          empresaId: empresa.id,
          supabaseUserId: authData?.user?.id,
        },
      });
    } else if (!usuario.supabaseUserId && authData?.user?.id) {
      await prisma.usuario.update({
        where: { email: userData.email },
        data: { supabaseUserId: authData.user.id },
      });
    }

    usuariosCreados.push(usuario!);
    console.log(`✅ Usuario: ${usuario!.nombre} (${usuario!.rol})`);
  }

  const adminUser = usuariosCreados.find((u) => u.rol === "ADMIN")!;

  // 3. Crear productos con talles
  const productosCreados = [];

  for (const prod of PRODUCTOS) {
    const { tallas, ...productoData } = prod;

    const producto = await prisma.producto.upsert({
      where: { empresaId_sku: { empresaId: empresa.id, sku: prod.sku } },
      update: {},
      create: {
        ...productoData,
        empresaId: empresa.id,
      },
    });

    for (const t of tallas) {
      await prisma.tallaje.upsert({
        where: {
          productoId_talla_color: {
            productoId: producto.id,
            talla: t.talla,
            color: t.color,
          },
        },
        update: {},
        create: {
          ...t,
          productoId: producto.id,
        },
      });
    }

    productosCreados.push(producto);
  }
  console.log(`✅ ${productosCreados.length} productos con talles creados`);

  // 4. Crear movimientos de ejemplo
  const tallasCreadas = await prisma.tallaje.findMany({
    where: { producto: { empresaId: empresa.id } },
  });

  const movimientosData: Array<{
    tipo: "ENTRADA" | "SALIDA" | "AJUSTE_POS" | "AJUSTE_NEG" | "DEVOLUCION";
    cantidad: number;
    motivo: string;
    usuarioId: string;
    tallajeId: string;
    createdAt: Date;
  }> = [];

  // Movimientos de ENTRADA (reposición de stock)
  const entradas = [
    "Reposición de stock proveedor",
    "Ingreso de mercadería nueva",
    "Recepción de pedido #1234",
    "Reposición de stock mínimo",
    "Ingreso por compra al mayorista",
    "Reposición urgente - bajo stock",
    "Ingreso de nueva temporada",
    "Recepción de importación",
    "Reposición semanal",
    "Ingreso de muestras",
  ];

  for (let i = 0; i < 10; i++) {
    const talle = tallasCreadas[randomInt(0, tallasCreadas.length - 1)];
    const usuario = usuariosCreados[randomInt(0, usuariosCreados.length - 1)];
    movimientosData.push({
      tipo: "ENTRADA",
      cantidad: randomInt(5, 30),
      motivo: entradas[i],
      usuarioId: usuario.id,
      tallajeId: talle.id,
      createdAt: randomDate(30),
    });
  }

  // Movimientos de SALIDA (ventas)
  const salidas = [
    "Venta en local",
    "Venta online - envío a domicilio",
    "Venta por mayorista",
    "Venta con descuento especial",
    "Venta por Instagram",
    "Venta a cliente frecuente",
    "Venta por Marketplace",
  ];

  for (let i = 0; i < 7; i++) {
    const talle = tallasCreadas[randomInt(0, tallasCreadas.length - 1)];
    const usuario = usuariosCreados.find((u) => u.rol !== "ALMACENERO")!;
    movimientosData.push({
      tipo: "SALIDA",
      cantidad: randomInt(1, 5),
      motivo: salidas[i],
      usuarioId: usuario.id,
      tallajeId: talle.id,
      createdAt: randomDate(25),
    });
  }

  // Movimientos de AJUSTE_POS (corrección por inventario)
  const ajustesPos = [
    "Corrección por inventario físico",
    "Ajuste por mercadería no registrada",
    "Corrección de carga anterior",
  ];

  for (let i = 0; i < 3; i++) {
    const talle = tallasCreadas[randomInt(0, tallasCreadas.length - 1)];
    movimientosData.push({
      tipo: "AJUSTE_POS",
      cantidad: randomInt(2, 8),
      motivo: ajustesPos[i],
      usuarioId: adminUser.id,
      tallajeId: talle.id,
      createdAt: randomDate(20),
    });
  }

  // Movimientos de AJUSTE_NEG (merma)
  const ajustesNeg = [
    "Merma por daño en depósito",
    "Corrección por productos defectuosos",
  ];

  for (let i = 0; i < 2; i++) {
    const talle = tallasCreadas[randomInt(0, tallasCreadas.length - 1)];
    movimientosData.push({
      tipo: "AJUSTE_NEG",
      cantidad: randomInt(1, 3),
      motivo: ajustesNeg[i],
      usuarioId: adminUser.id,
      tallajeId: talle.id,
      createdAt: randomDate(15),
    });
  }

  // Movimientos de DEVOLUCION
  const devoluciones = [
    "Devolución por talla incorrecta",
    "Devolución por defecto de fábrica",
  ];

  for (let i = 0; i < 2; i++) {
    const talle = tallasCreadas[randomInt(0, tallasCreadas.length - 1)];
    movimientosData.push({
      tipo: "DEVOLUCION",
      cantidad: randomInt(1, 2),
      motivo: devoluciones[i],
      usuarioId: usuariosCreados.find((u) => u.rol !== "ALMACENERO")!.id,
      tallajeId: talle.id,
      createdAt: randomDate(10),
    });
  }

  // Ordenar por fecha y crear
  movimientosData.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  await prisma.movimiento.createMany({ data: movimientosData });
  console.log(`✅ ${movimientosData.length} movimientos creados`);

  // Resumen
  const totalStock = await prisma.tallaje.aggregate({
    where: { producto: { empresaId: empresa.id } },
    _sum: { stock: true },
  });

  console.log("\n📊 Resumen del seed:");
  console.log(`   - Empresa: ${empresa.nombre}`);
  console.log(`   - Usuarios: ${usuariosCreados.length}`);
  console.log(`   - Productos: ${productosCreados.length}`);
  console.log(`   - Movimientos: ${movimientosData.length}`);
  console.log(`   - Stock total: ${totalStock._sum.stock ?? 0} unidades`);
  console.log("\n🔐 Credenciales de usuario:");
  for (const u of USUARIOS) {
    console.log(`   - ${u.email}`);
  }
  console.log("\n✅ Seed completado correctamente");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

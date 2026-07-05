# Checklist — Stock Calzado SaaS

---

## FASE 1: Auth y Base ✅

- [x] Schema Prisma (Empresa, Usuario, Producto, Tallaje, Movimiento)
- [x] Conexión a Supabase PostgreSQL con Prisma
- [x] Prisma Client singleton (`src/lib/prisma.ts`)
- [x] Supabase Auth (clientes: client, server, middleware)
- [x] Login (page + server action)
- [x] Registro con auto-creación de Empresa (page + server action)
- [x] Logout
- [x] Middleware de sesión (refresh tokens)
- [x] Dashboard layout con auth guard y sidebar
- [x] Seed data (1 empresa, 3 productos con talles)

---

## FASE 2: Navegación y Layout del Dashboard ✅

- [x] Reestructurar rutas: `(dashboard)` → `dashboard/` para URLs correctas
- [x] Crear ruta `/dashboard` (home con stats)
- [x] Crear ruta `/dashboard/productos` (listado con tabla)
- [x] Crear ruta `/dashboard/movimientos` (listado con tabla)
- [x] Sidebar responsive (hamburger menu en mobile)
- [x] Indicador de ruta activa en sidebar
- [x] Loading states (`loading.tsx`)
- [x] Error boundaries (`error.tsx`)
- [x] Not-found page (`not-found.tsx`)
- [x] Middleware con protección de rutas y redirección automática

---

## FASE 3: Componentes Shared (UI Library) ✅

- [x] Crear directorio `src/components/ui/`
- [x] Button (variantes: primary, secondary, danger, ghost, outline + loading)
- [x] Input (con label, error state, helper text)
- [x] Select (con label, error, placeholder, options)
- [x] Table (Table, TableHead, TableBody, TableRow, TableHeadCell, TableCell, TableEmpty)
- [x] Modal / Dialog (con `<dialog>` nativo)
- [x] Badge / Tag (variantes: default, success, warning, danger, info)
- [x] Card (Card, CardHeader, CardContent, CardFooter)
- [x] Alert (variantes: info, success, warning, error)
- [x] Skeleton / Loading spinner (Skeleton, SkeletonText, SkeletonTable)
- [x] Confirm dialog (para acciones destructivas)
- [x] Pagination (con ellipsis para muchas páginas)
- [x] Search input (con ícono de búsqueda)
- [x] Barrel export (`src/components/ui/index.ts`)

---

## FASE 4: Gestión de Productos ✅

### Listado (`/dashboard/productos`)
- [x] Tabla con: SKU, nombre, marca, categoría, precio, stock total, estado
- [x] Link a detalle de cada producto (SKU clickeable)
- [x] Botón "Nuevo Producto"
- [x] Búsqueda por nombre/SKU/marca
- [x] Filtro por categoría
- [x] Filtro por estado (activo/inactivo)
- [x] Filtro por marca
- [x] Paginación

### Creación (`/dashboard/productos/nuevo`)
- [x] Campos: SKU, nombre, marca, modelo, descripción, categoría (select), precio, imagen URL
- [ ] Validación con Zod
- [x] Server action `crearProducto()`
- [x] Redirigir al listado después de crear

### Detalle (`/dashboard/productos/[id]`)
- [x] Info del producto
- [x] Tabla de talles/colores con stock
- [x] Botón editar
- [x] Botón activar/desactivar

### Edición (`/dashboard/productos/[id]/editar`)
- [x] Pre-cargar datos existentes
- [x] Server action `actualizarProducto()`

### Gestión de talles (desde detalle del producto)
- [x] Agregar nuevo talle/color
- [x] Editar stock mínimo
- [x] Eliminar talle
- [x] Server actions: `crearTallaje()`, `actualizarTallaje()`, `eliminarTallaje()`

---

## FASE 5: Gestión de Movimientos (Stock) ✅

### Listado (`/dashboard/movimientos`)
- [x] Tabla con: fecha, tipo, producto, talla/color, cantidad, usuario
- [x] Badges con colores por tipo de movimiento
- [x] Indicador visual de entrada (+verde) vs salida (-rojo)
- [x] Filtro por tipo (ENTRADA, SALIDA, AJUSTE_POS, AJUSTE_NEG, DEVOLUCION)
- [x] Paginación
- [x] Resumen: total entradas, total salidas, movimientos del mes
- [x] Filtro por producto
- [x] Filtro por fecha (rango)
- [x] Filtro por usuario

### Creación (`/dashboard/movimientos/nuevo`)
- [x] Select de producto → select de talla/color (cascada)
- [x] Tipo de movimiento (select)
- [x] Cantidad
- [x] Motivo (opcional)
- [x] Validación: no permitir stock negativo en SALIDA
- [x] Server action `crearMovimiento()` con transacción
- [x] Actualizar stock del tallaje automáticamente

### Detalle (`/dashboard/movimientos/[id]`)
- [x] Info completa del movimiento
- [x] Datos del usuario que lo creó
- [x] Datos del producto/talle afectado
- [x] Stock actual del talle

---

## FASE 6: Dashboard Home / Estadísticas ✅

- [x] KPIs: total productos, stock total, movimientos del mes
- [x] Productos con stock bajo (bajo `stockMinimo`) con colores por criticidad
- [x] Últimos movimientos realizados (tabla con 10 más recientes)
- [x] Accesos rápidos (nuevo producto, nuevo movimiento) — solo ADMIN
- [x] Resumen de entradas/salidas del mes en card de stock
- [x] Gráfico de movimientos recientes (últimos 30 días)

---

## FASE 7: Gestión de Usuarios (Multi-tenant) ✅

### Permisos granulares
- [x] Campo `puedeEditarStock` en schema Prisma
- [x] ADMIN siempre puede editar stock
- [x] VENDEDOR/ALMACENERO: solo si tienen `puedeEditarStock`

### Página de usuarios (`/dashboard/usuarios`) — solo ADMIN
- [x] Tabla con: nombre, email, rol, puede editar stock, fecha creación
- [x] Link a detalle/edición de cada usuario
- [x] Crear usuario manual (asignar a la empresa)
- [x] Editar rol de usuario
- [x] Eliminar usuario (no el propio)
- [x] Server actions: `crearUsuario()`, `actualizarUsuario()`, `eliminarUsuario()`

### Control de acceso por rol
- [x] Sidebar: "Usuarios" visible solo para ADMIN
- [x] Botón "Nuevo Movimiento": visible si `rol === ADMIN || puedeEditarStock`
- [x] Páginas de usuarios: protegidas para ADMIN

---

## FASE 8: Perfil y Configuración ✅

### Perfil (`/dashboard/perfil`)
- [x] Editar nombre
- [x] Cambiar contraseña (via Supabase Auth)
- [x] Info de la empresa (solo lectura)
- [x] Server actions: `actualizarPerfil()`, `cambiarContrasena()`

### Configuración de empresa (`/dashboard/configuracion`) — solo ADMIN
- [x] Editar nombre de empresa
- [x] Logo de empresa
- [x] Slug de empresa (solo lectura)
- [x] Server action: `actualizarEmpresa()`
- [x] Links en sidebar (Mi Perfil + Configuración)

---

## FASE 9: Validación y Formularios ✅

- [x] `zod` ya instalado (dependencia existente)
- [x] Crear schemas de validación compartidos (`src/lib/validations/`)
  - [x] `auth.ts` (login, register)
  - [x] `producto.ts` (crear, actualizar)
  - [x] `tallaje.ts` (crear, actualizar)
  - [x] `movimiento.ts` (crear)
  - [x] `usuario.ts` (crear, actualizar)
  - [x] `perfil.ts` (perfil, contraseña, empresa)
- [x] Integrar validación en todos los server actions
- [x] Mostrar errores de validación en los formularios (primer error de Zod)

---

## FASE 10: UX y Pulido ✅

- [x] Toast notifications para éxito/error (`sonner`)
- [x] Confirm dialogs antes de eliminar (ya existía)
- [x] Optimistic updates en formularios (pendiente futuro)
- [x] Empty states (cuando no hay productos, movimientos, etc.)
- [x] Skeleton loaders durante carga
- [x] Foco automático en primer input de formularios
- [x] Print-friendly view para reportes (CSS `@media print`)

---

## FASE 10.5: Fortalecimiento de Seguridad ✅

### Crítico (corregido)
- [x] `getUsuarioPorId` — agregado filtro `empresaId` (antes devolvía usuarios de otras empresas)
- [x] `actualizarUsuario` — agregado filtro `empresaId` (antes modificaba usuarios de otras empresas)
- [x] `eliminarUsuario` — agregado filtro `empresaId` con `findFirst`

### Alto (corregido)
- [x] Actions de productos — agregado role check (`ADMIN` requerido para crear/editar/toggle)
- [x] Actions de talles — agregado role check (`ADMIN` requerido para crear/editar/eliminar)
- [x] Actions de movimientos — agregado permission check (`puedeEditarStock` o `ADMIN`)

### Medio (corregido)
- [x] SKU uniqueness cambiado de global a por empresa (`@@unique([empresaId, sku])`)
- [x] SKU check en `crearProducto` usa `findFirst` con `empresaId`

### Bajo (corregido)
- [x] Null guards — pages usan `requireUsuarioAuth()` en vez de `getUsuarioActual()` + `!`
- [x] Helper `requireUsuarioAuth()` redirige a `/login` si no hay sesión

### Archivos creados/modificados
- `src/lib/auth-helpers.ts` — helpers de seguridad (`requireUsuarioAuth`, `requireRole`, `requireAdmin`, `requirePermStock`, etc.)
- `src/app/dashboard/usuarios/actions.ts` — fixes críticos
- `src/app/dashboard/productos/actions.ts` — role checks
- `src/app/dashboard/movimientos/actions.ts` — permission checks
- `src/app/dashboard/page.tsx` — null guard
- `src/app/dashboard/productos/page.tsx` — null guard
- `src/app/dashboard/movimientos/page.tsx` — null guard
- `prisma/schema.prisma` — SKU uniqueness por empresa

---

## FASE 11: Datos y Seed ✅

- [x] Seed mejorado: crear empresa + admin user (con Supabase Auth)
- [x] Seed con más productos variados (12 productos)
- [x] Datos de ejemplo con movimientos variados (24 movimientos)
- [x] Script para resetear la DB (`db:reset`)

---

## FASE 12: Testing ✅

- [x] Instalar Vitest
- [x] Tests para validaciones Zod (auth, producto, tallaje, movimiento)
- [x] Tests para rate limiter
- [ ] Tests para server actions (login, register, CRUD)
- [ ] Tests para helpers (getUsuarioActual, etc.)
- [ ] Test de integración: flujo completo de registro → producto → movimiento

---

## FASE 13: Deployment

- [x] Configurar next.config.ts (headers de seguridad, serverExternalPackages)
- [x] Variables de entorno documentadas (.env.example)
- [x] Health check endpoint (/api/health)
- [x] Rate limiting en auth actions
- [x] Middleware migrado a proxy (Next.js 16)
- [x] Logging estructurado (Pino)
- [ ] Configurar Vercel (conectar repo, setear env vars)
- [ ] Configurar dominio
- [ ] Backup de DB (Supabase)

---

## FASE 14: Features Avanzadas (futuro)

- [ ] Exportar datos a CSV/Excel
- [ ] Reportes PDF (stock, movimientos)
- [ ] Dashboard con gráficos interactivos (Recharts/Chart.js)
- [ ] Notificaciones por email (bajo stock)
- [ ] API pública para integraciones
- [ ] Modo offline (PWA)
- [ ] Multi-idioma (i18n)

---

## Errores conocidos a corregir

- [x] Sidebar links rotos → reestructurados a `/dashboard/*`
- [x] `middleware.ts` deprecated → migrado a `proxy.ts` (Next.js 16)
- [x] Variables `NEXTAUTH_*` eliminadas de `.env` y `AGENTS.md` actualizado

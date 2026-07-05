# PRD — Stock Calzado

## 1. Resumen del Producto

**Stock Calzado** es una aplicación web multi-tenant para la gestión de stock de calzado. Permite a empresas controlar inventario de productos (zapatillas, botas, sandalias, etc.), registrar movimientos de entrada/salida, y generar reportes.

**Stack técnico:** Next.js 16 (App Router) + TypeScript, Tailwind CSS v4, Prisma 7 + PostgreSQL (Supabase), React 19.

---

## 2. Modelo de Datos (Multi-tenant)

| Entidad | Descripción |
|---|---|
| **Empresa** | Tenant raíz. Tiene `nombre`, `slug`, `logo`. |
| **Usuario** | Perteneciente a una Empresa. Roles: `ADMIN`, `VENDEDOR`, `ALMACENERO`. Campo `puedeEditarStock` para vendedores. |
| **Producto** | Bienes de la empresa. Campos: `sku`, `nombre`, `marca`, `modelo`, `categoria` (enum: ZAPATILLAS, BOTAS, SANDALIAS, ZAPATOS, DEPORTIVOS, OTROS), `precio`, `activo`. |
| **Tallaje** | Variante de un Producto por talla/color. Campos: `talla`, `color`, `stock`, `stockMinimo`. |
| **Movimiento** | Registro de entrada/salida de stock. Tipos: `ENTRADA`, `SALIDA`, `AJUSTE_POS`, `AJUSTE_NEG`, `DEVOLUCION`. |
| **Notificacion** | Alertas del sistema para la empresa. |

---

## 3. Funcionalidades por Sección

### 3.1 Autenticación (`/login`, `/register`)

| Test | Descripción |
|---|---|
| Login con credenciales válidas | Ingresa email + password → redirige a `/dashboard` |
| Login con credenciales inválidas | Muestra error "Email o contraseña incorrectos" |
| Login con campos vacíos | Valida HTML required |
| Registro exitoso | Crea empresa + usuario → redirige a `/dashboard` |
| Registro con contraseña < 6 chars | Muestra error de validación |
| Registro con emails duplicados | Muestra error de duplicado |
| Navegación login ↔ register | Links funcionan correctamente |
| Logout | Botón "Cerrar sesión" → vuelve a `/login` |

### 3.2 Dashboard (`/dashboard`)

| Test | Descripción |
|---|---|
| Dashboard con datos | Muestra 4 cards: Productos activos, Stock total, Movimientos mes, Stock bajo |
| Gráfico de movimientos | Renderiza chart de 30 días (entradas/salidas) |
| Lista de stock bajo | Muestra productos con stock ≤ 5 (si existen) |
| Actividad reciente | Tabla con últimos 10 movimientos |
| Acciones ADMIN | Botones "+ Producto", "+ Movimiento", "Reporte PDF" visibles |
| Acciones VENDEDOR con permiso | Solo ve "+ Movimiento" si `puedeEditarStock=true` |
| Acciones VENDEDOR sin permiso | No ve botones de acción |
| Redirección sin sesión | Si no está autenticado → `/login` |

### 3.3 Productos (`/dashboard/productos`)

| Test | Descripción |
|---|---|
| Listar productos | Tabla con SKU, nombre, marca, categoría, precio, stock, estado |
| Filtros | Búsqueda por texto, filtro por categoría, estado (activo/inactivo), marca |
| Paginación | Navegación entre páginas (20 items/página) |
| Crear producto | Formulario: SKU, nombre, marca, modelo, categoría, precio, descripción |
| Ver detalle (`/productos/[id]`) | Muestra info completa + tabla de talles |
| Editar producto (`/productos/[id]/editar`) | Modifica campos del producto |
| Toggle activo/inactivo | Botón para activar/desactivar producto |
| Agregar talle | Modal para crear tallaje (talla, color, stock, stockMínimo) |
| Editar talle | Modal para modificar tallaje existente |
| Exportar productos | Botón exporta a Excel |
| Reporte PDF stock | Genera PDF con reporte de stock |

### 3.4 Movimientos (`/dashboard/movimientos`)

| Test | Descripción |
|---|---|
| Listar movimientos | Tabla con fecha, tipo, producto, talla/color, cantidad, usuario |
| Filtros | Filtrar por tipo, producto, rango de fechas |
| Crear movimiento | Formulario: producto → tallaje → tipo → cantidad → motivo |
| Tipos válidos | Entrada, Salida, Ajuste positivo, Ajuste negativo, Devolución |
| Validación stock insuficiente | Error al intentar salida con stock < cantidad |
| Ver detalle (`/movimientos/[id]`) | Muestra info completa del movimiento |
| Reporte PDF movimientos | Genera PDF con historial |
| Solo usuarios con permiso | ADMIN o usuarios con `puedeEditarStock=true` |

### 3.5 Usuarios (`/dashboard/usuarios`) — Solo ADMIN

| Test | Descripción |
|---|---|
| Listar usuarios | Tabla con nombre, email, rol, estado |
| Crear usuario | Formulario: nombre, email, password, rol, puedeEditarStock |
| Editar usuario (`/usuarios/[id]`) | Modifica datos del usuario |
| Acceso restringido | VENDEDOR/ALMACENERO no pueden acceder |

### 3.6 Configuración (`/dashboard/configuracion`) — Solo ADMIN

| Test | Descripción |
|---|---|
| Ver configuración | Muestra datos de la empresa |
| Editar empresa | Cambia nombre, logo, slug |
| Acceso restringido | Solo ADMIN puede acceder |

### 3.7 Perfil (`/dashboard/perfil`)

| Test | Descripción |
|---|---|
| Ver perfil | Muestra datos del usuario actual |
| Editar perfil | Permite cambiar nombre y contraseña |

### 3.8 Notificaciones

| Test | Descripción |
|---|---|
| Campana de notificaciones | Muestra badge con cantidad de no leídas |
| Abrir panel | Lista notificaciones recientes |
| Marcar como leído | Actualiza estado de lectura |

### 3.9 API Endpoints

| Endpoint | Método | Descripción |
|---|---|---|
| `/api/health` | GET | Health check (DB connectivity) |
| `/api/notifications` | GET | Lista notificaciones del usuario |
| `/api/notifications/read` | POST | Marca notificaciones como leídas |
| `/api/reports/ejecutivo` | GET | Reporte ejecutivo PDF |
| `/api/reports/stock` | GET | Reporte de stock PDF |
| `/api/reports/movimientos` | GET | Reporte de movimientos PDF |

---

## 4. Requisitos No Funcionales

- **Multi-tenant:** Cada empresa solo ve sus datos (filtrado por `empresaId`).
- **Roles y permisos:** ADMIN tiene acceso total. VENDEDOR/ALMACENERO requieren `puedeEditarStock` para movimientos.
- **Responsive:** Sidebar colapsable en móvil, tablas con tarjetas móviles.
- **Validación:** Formularios con Zod server-side, HTML5 required client-side.
- **Exportación:** Excel (xlsx) y PDF (jspdf + jspdf-autotable).

---

## 5. Credenciales de Test (Seed)

El seed (`npm run db:seed`) crea:
- 1 empresa: "Mi Empresa"
- 3 usuarios: admin@test.com / vendedor@test.com / almacenero@test.com (password: `password123`)
- 12 productos con talles
- 24+ movimientos de ejemplo

---

## 6. URLs de Navegación

```
/                          → Redirect a /login o /dashboard
/login                     → Formulario de login
/register                  → Formulario de registro
/dashboard                 → Panel principal (stats + gráfico)
/dashboard/productos       → Listado de productos
/dashboard/productos/nuevo → Crear producto
/dashboard/productos/[id]  → Detalle de producto
/dashboard/productos/[id]/editar → Editar producto
/dashboard/movimientos     → Listado de movimientos
/dashboard/movimientos/nuevo → Crear movimiento
/dashboard/movimientos/[id] → Detalle de movimiento
/dashboard/usuarios        → Listar usuarios (ADMIN)
/dashboard/usuarios/nuevo  → Crear usuario (ADMIN)
/dashboard/usuarios/[id]   → Editar usuario (ADMIN)
/dashboard/perfil          → Mi perfil
/dashboard/configuracion   → Config empresa (ADMIN)
```

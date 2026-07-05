# Responsive Design — Inicio / Productos / Movimientos / Usuarios

**Date:** 2026-07-02
**Status:** Approved
**Scope:** 4 pages + shared components

---

## Problem

The 4 main dashboard pages (Inicio, Productos, Movimientos, Usuarios) have responsive design issues on mobile (375px) and tablet (768px):

1. Tables force horizontal scroll via `whitespace-nowrap` on all cells
2. The "Acciones" column in Movimientos is always visible, causing overflow on mobile
3. Filters in Productos/Movimientos stack vertically, pushing content below the fold (~250px)
4. The Usuarios table shows only 2 columns on mobile (Nombre + Rol), making it nearly useless
5. Touch targets on small buttons are below 32px (WCAG minimum is 44px)

---

## Design Decisions

### 1. Tables → Cards on Mobile

**Pattern:** Below `sm:` (640px), every table renders as a list of cards. Each table row becomes a card.

**Card layout template:**

```
┌─────────────────────────────┐
│ Primary title               │  ← font-semibold, indigo link
│ Subtitle (SKU, date, etc)   │  ← text-sm text-slate-500
│                             │
│ Badge1  ·  Badge2           │  ← inline badges
│                             │
│ Secondary data              │  ← text-sm text-slate-600
└─────────────────────────────┘
```

**Implementation approach:**

- Create a new `ResponsiveTable` wrapper component in `src/components/ui/responsive-table.tsx`
- It accepts `columns` (for desktop table) and a `renderCard` function (for mobile cards)
- Below `sm:`, it renders the card list; at `sm:` and above, it renders the standard `<Table>`
- Each page defines its own card layout via the `renderCard` prop
- The existing `whitespace-nowrap` is removed from `TableCell` — cells use `truncate` instead

**Per-page card designs:**

#### Inicio (Dashboard Activity)
```
┌─────────────────────────────┐
│ 12/06/2026         Entrada  │  ← date link + tipo badge
│ Nike Air Max 90             │  ← product name
│ Talla 42 · Negro    +10     │  ← size/color + quantity
└─────────────────────────────┘
```

#### Productos
```
┌─────────────────────────────┐
│ NIKE-AM90                   │  ← SKU (mono, indigo link)
│ Nike Air Max 90             │  ← product name
│ Zapatillas  ·  Activo       │  ← categoria badge + estado badge
│ $129.99          Stock: 42  │  ← price + total stock
└─────────────────────────────┘
```

#### Movimientos
```
┌─────────────────────────────┐
│ 12/06/2026         Entrada  │  ← date link + tipo badge
│ Nike Air Max 90             │  ← product name
│ Talla 42 · Negro    +10     │  ← size/color + quantity
│ Juan Pérez                  │  ← user name
└─────────────────────────────┘
```
Note: No "Acciones" in mobile card — user taps to go to detail page.

#### Usuarios
```
┌─────────────────────────────┐
│ Juan Pérez           Admin  │  ← name (indigo link) + rol badge
│ juan@empresa.com            │  ← email
│ Editar stock: Sí  ·  Creado │  ← permission + date
│ 12/06/2026                  │
└─────────────────────────────┘
```

---

### 2. Hide "Acciones" Column on Mobile

The "Acciones" column (Editar + Eliminar) in Movimientos is hidden below `sm:` via `hidden sm:table-cell` on both `<TableHeadCell>` and `<TableCell>`.

In the mobile card view, no action buttons are rendered. The user navigates to the detail page (`/dashboard/movimientos/[id]`) which already has edit/delete buttons.

**File:** `src/app/dashboard/movimientos/page.tsx`

---

### 3. Collapsible Filters on Mobile

**Pattern:** Below `sm:`, filters collapse behind a toggle button. Only the search input stays visible.

**Mobile (collapsed):**
```
┌──────────────────────────┐
│ 🔍 Buscar...             │
│ [⚙ Filtros (3)]          │  ← shows count of active filters
└──────────────────────────┘
```

**Mobile (expanded):**
```
┌──────────────────────────┐
│ 🔍 Buscar...             │
│ Marca: [Todas      ▼]   │
│ Categoría: [Todas   ▼]  │
│ Estado: [Todos     ▼]   │
│ [Limpiar filtros]        │
└──────────────────────────┘
```

**Desktop (≥640px):** Filters render inline as before.

**Implementation:**
- Add `useState` for `filtersOpen` (default `false`)
- On mobile: search input always visible, toggle button below it, filters in a collapsible div
- The toggle button shows active filter count: "Filtros (2)" when 2 non-default filters are set
- A "Limpiar filtros" link appears when any filter is active

**Files:**
- `src/app/dashboard/productos/product-filters.tsx`
- `src/app/dashboard/movimientos/movement-filters.tsx`

---

### 4. Touch Target Improvements

All interactive elements adjusted to minimum ~32px height (compromise between 44px WCAG ideal and visual density):

| Component | Current | New | File |
|-----------|---------|-----|------|
| Button `sm` | `py-1.5 text-xs` | `py-2 text-xs` | `button.tsx` |
| Pagination buttons | `py-1.5 text-sm` | `py-2 text-sm` | `pagination.tsx` |
| Hamburger menu | `p-2` | `p-2.5` | `sidebar.tsx` |
| Sidebar close | `p-1` | `p-2` | `sidebar.tsx` |
| Logout button | `py-1.5` | `py-2` | `layout.tsx` |

---

### 5. Text Truncation

| Location | Fix | File |
|----------|-----|------|
| Product name in cards | `truncate` on title element | Per-page card renderers |
| SKU in cards | `font-mono truncate` | Per-page card renderers |
| Subtitles (SKU · Talla · Color) | `truncate` on `<p>` | Per-page card renderers |

---

## Files to Modify

| # | File | Changes |
|---|------|---------|
| 1 | `src/components/ui/table.tsx` | Remove `whitespace-nowrap` from `TableCell`, add `truncate` |
| 2 | `src/components/ui/responsive-table.tsx` | **NEW** — wrapper component for table/card switching |
| 3 | `src/components/ui/button.tsx` | Increase `sm` padding from `py-1.5` to `py-2` |
| 4 | `src/components/ui/pagination.tsx` | Increase button padding, add `flex-wrap` |
| 5 | `src/app/dashboard/page.tsx` | Card layout for activity table, truncation |
| 6 | `src/app/dashboard/productos/page.tsx` | Card layout for products, truncation |
| 7 | `src/app/dashboard/productos/product-filters.tsx` | Collapsible filters on mobile |
| 8 | `src/app/dashboard/movimientos/page.tsx` | Card layout, hide Acciones column, truncation |
| 9 | `src/app/dashboard/movimientos/movement-filters.tsx` | Collapsible filters on mobile |
| 10 | `src/app/dashboard/usuarios/page.tsx` | Card layout for users |
| 11 | `src/app/dashboard/components/sidebar.tsx` | Increase touch targets |
| 12 | `src/app/dashboard/layout.tsx` | Increase logout button touch target |

**Total: 12 files (1 new, 11 modified)**

---

## Testing Strategy

1. Visual testing at 375px, 768px, and 1280px widths
2. Verify all cards render correctly with long content (truncate works)
3. Verify filter toggle works on mobile
4. Verify pagination touch targets are usable
5. Run `npm run build` — no type errors
6. Run `npm run lint` — no new warnings
7. Run `npm run test` — all tests pass

---

## Out of Scope

- Dark mode responsive adjustments
- New page-level routes
- Changes to the sidebar navigation structure
- Touch target improvements beyond 32px (would require significant layout changes)

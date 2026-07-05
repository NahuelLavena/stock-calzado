# AGENTS.md — Stock Calzado

## Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4
- **ORM**: Prisma 7 with `@prisma/adapter-pg` (driver adapter pattern)
- **Database**: PostgreSQL (Supabase) with connection pooling via Supavisor
- **Runtime**: Node.js

## Quick Commands

```bash
npm run dev           # Start dev server
npm run build         # Production build
npm run start         # Start production server
npm run lint          # ESLint check
npm run test          # Run tests (Vitest)
npm run db:push       # Push schema changes to DB
npm run db:migrate    # Create & apply migration
npm run db:seed       # Seed sample data (tsx prisma/seed.ts)
npm run db:reset      # Reset DB + re-seed (force reset + seed)
npm run db:studio     # Open Prisma Studio
npm run db:generate   # Regenerate Prisma Client
```

## Database

### Supabase connection (dual-URL setup)

`.env` must have both:
- `DATABASE_URL` — pooled connection (port 6543, `?pgbouncer=true`) for runtime queries
- `DIRECT_URL` — direct connection (port 5432) for Prisma CLI/migrations

`prisma.config.ts` uses `DIRECT_URL` for migrations. `src/lib/prisma.ts` uses `DATABASE_URL` for app runtime.

### Prisma Client output

Schema generates to `src/generated/prisma` (not `node_modules`). Import path:
```ts
import { PrismaClient } from "@/generated/prisma/client";
```

### Seed

Seed script is `prisma/seed.ts`, runs via `tsx` (not `ts-node`). Configured in `package.json` under `"prisma"`.
Seed uses `dotenv/config` explicitly — env vars are not auto-loaded.
Seed uses Supabase Admin API to create auth users — requires `SUPABASE_SERVICE_ROLE_KEY` in `.env`.
Seed creates: 1 empresa, 3 users (admin/vendedor/almacenero), 12 products with tallas, 24+ movements.

### Multi-tenant model

Schema is multi-tenant: `Empresa` → `Usuario` / `Producto` → `Tallaje` → `Movimiento`. All foreign keys use `onDelete: Cascade`.

## Project Structure

```
src/
  app/              # Next.js App Router (routes)
  lib/
    prisma.ts       # Prisma client singleton (global in dev)
  generated/prisma/ # Auto-generated Prisma Client (gitignored)
prisma/
  schema.prisma     # Database schema
  seed.ts           # Seed data
```

## Path Alias

`@/*` maps to `./src/*` (configured in tsconfig.json).

## Prisma Gotchas

- **Never** instantiate `PrismaClient` directly in route handlers — always import from `src/lib/prisma.ts`.
- `PrismaClient` requires the `PrismaPg` adapter with a `connectionString`. Passing no args fails with SASL auth errors.
- `tsx` is required for seed (Prisma generated client is ESM; `ts-node` with CommonJS fails).
- After schema changes: `npm run db:push` (dev) or `npm run db:migrate` (production), then `npm run db:generate`.

## Next.js 16 Notes

- App Router with `src/app/` directory.
- This version has breaking changes from prior versions. Check `node_modules/next/dist/docs/` if uncertain about APIs.
- `middleware.ts` is deprecated. Use `src/proxy.ts` instead. Export `proxy()` function, not `middleware()`.
- ESLint uses flat config (`eslint.config.mjs`) with `eslint-config-next`.

## Environment

`.env` contains secrets — never commit. Already in `.gitignore`.

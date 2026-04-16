# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Blūmi Events (Main App)

Frontend-only event management platform prototype at `/`. Built with React + Vite + Tailwind CSS.

### Brand Identity
- Principal: #314C5D (blue-petrol)
- Primary accent: #DEFF66 (lime-green)
- Pink accent: #FF6982
- Light blue: #29D4FF
- Orange: #FF8C69
- Background: #FBF7EB (warm off-white)
- Fonts: Plus Jakarta Sans (headings), Inter (body)

### Features
- **Auth simulation**: Context-based role switching (admin/participant)
- **Admin**: Sidebar navigation, event creation form, event dashboard with metrics, participant table, screening questions CRUD, check-in terminal
- **Subeventos**: Events with `tipo: 'feira'` show a "Subeventos" tab with CRUD modal, type filters, detail drawer with metrics/participant list/encerrar action. Supports two check-in modes: `inscricao` (pre-registration required) and `checkin_livre` (any event participant)
- **Check-in with subeventos**: Dropdown selector in check-in terminal to switch between event-level and sub-event check-in. Different validation logic per mode and distinct feedback messages
- **Participant**: Public event page with registration modal (2-step), participant area with QR codes, past events with certificate download
- **Check-in**: Dark-mode terminal with USB scanner support, Web Audio API beep, manual search, real-time counter

### Architecture
- All data is mock/local (useState) — no backend needed
- Mock data in `src/lib/mock-data.ts`
- Global state via React Context (`EventStoreProvider`)
- Routing with wouter
- Components organized by domain: `admin/`, `layout/`

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

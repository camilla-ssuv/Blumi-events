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
- Background: #F5F6F8 (light cool gray — NOT the warm cream #FBF7EB)
- Fonts: Plus Jakarta Sans (headings), Inter (body)

### Features
- **Auth simulation**: Context-based role switching (admin/participant)
- **Admin**: Sidebar navigation, event creation form, event dashboard with metrics, participant table, screening questions CRUD, check-in terminal
- **Subeventos**: Events with `tipo: 'feira'` show a "Subeventos" tab with CRUD modal, type filters, detail drawer with metrics/participant list/encerrar action. Supports two check-in modes: `inscricao` (pre-registration required) and `checkin_livre` (any event participant)
- **Check-in with subeventos**: Dropdown selector in check-in terminal to switch between event-level and sub-event check-in. Different validation logic per mode and distinct feedback messages
- **Event catalog**: `/eventos` public discovery page with hero, search, 4 filter types (tipo pills, data/cidade/empresa dropdowns), 3-col card grid with hover lift, "Por convite" badge, vagas color coding, empty state, URL query params sync. Dynamic `catalogEventsList` state in EventStoreProvider (initialized from static array, new events added via `addCatalogEvent`)
- **Invite code**: Events with `visibilidade: 'convite'` require invite code "BLUEMI2025" in registration modal step 1
- **Public feira page**: Landing page shows "O que acontece na feira" section with sub-event cards (2-col grid), type filters, colored top borders, "Quero participar" for pre-registration subs, "Entrada livre" for check-in livre stands, low-vagas warnings
- **Sub-event detail page**: `/eventos/[slug]/[sub-slug]` individual page with colored header, progress bar, registration modal or info box depending on mode
- **Participant area with subs**: "Suas atividades na feira" section with per-sub-event QR codes and status badges, past events with individual sub-event certificate download
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

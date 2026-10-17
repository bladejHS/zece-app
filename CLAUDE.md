ZECE-APP

Aplicație web full-stack pentru gestionarea internă a resurselor și aprobări, destinată echipelor operaționale. Prioritizează acuratețea datelor, auditabilitatea și UX-ul clar în detrimentul animațiilor complexe sau al feature-urilor experimentale.



\# Tech Stack \& Architecture

\- Framework: Next.js 15 App Router (Server Components default)

\- Language: TypeScript 5.7+ strict mode, no `any`

\- Database: PostgreSQL 16 + Drizzle ORM (schema-first, migrations versionate)

\- Styling: Tailwind CSS 4 + shadcn/ui (componente copy-paste, nu library import)

\- Validation: Zod pentru toate input-urile externe și API responses

\- State: React Server Components + Server Actions; client state doar când e strict necesar (Zustand)

\- Structure: Feature-based modules în `/src/features/\\\[feature-name]/{components,actions,schema,types}`

\- Auth: Better Auth (type-safe, session-based)

\- Testing: Vitest (unit/integration) + Playwright (E2E)



\# Commands

\- Dev: `pnpm dev`

\- Test unitar: `pnpm test:unit`

\- Test E2E: `pnpm test:e2e`

\- Lint + format: `pnpm lint \\\&\\\& pnpm format:check`

\- Type check: `pnpm tsc --noEmit`

\- DB migrate: `pnpm db:migrate`

\- Build: `pnpm build`

\- Validate all: `pnpm validate` (rulează typecheck + lint + test:unit)



\# Coding Rules

\- Server Components sunt default; `'use client'` doar când interactivitatea cere neapărat

\- Toate datele externe (API, form, DB read) se validează cu Zod înainte de utilizare

\- Fără `any`, `as`, sau type assertions nesigure; preferă guard-uri și narrowing

\- Server Actions returnează `{ success: boolean; data?: T; error?: string }` — niciodată throw direct

\- Componentele UI sunt pure și primesc props tipate; logica stă în hooks/actions

\- Commit messages în română, format Conventional Commits (`feat:`, `fix:`, `refactor:`)

\- Nu adăuga comentarii care explică \*ce\* face codul; doar \*de ce\* dacă e contraintuitiv

\- Fiecare feature nou trebuie să includă cel puțin un test integration în `/tests`

\- Import paths relative max 2 nivele; altfel folosește path aliases (`@/features/...`)


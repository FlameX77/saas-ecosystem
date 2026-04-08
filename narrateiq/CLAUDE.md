# NarrateIQ — Claude Code Instructions

## Project Overview

NarrateIQ is a production AI SaaS that converts raw financial exports (CSV, PDF, Excel from Zoho Books / QuickBooks) into board-ready narrative reports, variance alerts, and an interactive "Ask My Data" chat. Target market: UAE SMBs and clinic CFOs.

## Tech Stack

- **Frontend:** Next.js 14 App Router, TypeScript (strict), Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL via Supabase, Drizzle ORM
- **AI:** Anthropic Claude (`claude-sonnet-4-0`) via `@anthropic-ai/sdk` + Vercel AI SDK streaming
- **Auth:** Supabase Auth (email/password + Google OAuth)
- **Storage:** Supabase Storage
- **Payments:** Stripe
- **Deployment:** Vercel

## Architecture Rules

1. **All AI calls go through `/lib/ai/client.ts`** — never import `@anthropic-ai/sdk` or `ai` directly in components or API routes.
2. **All DB queries go through `/lib/db/client.ts`** — never use `process.env.DATABASE_URL` directly.
3. **All file validation goes through `/lib/validators/upload.ts`** — validate type, size, and content before any processing.
4. **Auth is enforced at two layers:** `middleware.ts` (route-level) AND inside API routes (row-level).
5. **RLS is always on** — every Supabase table has row-level security policies. Service role is only used server-side.

## Code Standards

- **TypeScript strict mode** — no `any`, no `as unknown`, no non-null assertions without comments.
- **Tailwind only** — no custom CSS unless absolutely necessary.
- **Error handling** — every API route returns `{ error: string }` on failure with correct HTTP status.
- **Zod validation** — validate all incoming request bodies with Zod schemas.
- **No secrets client-side** — `NEXT_PUBLIC_` prefix only for non-sensitive config.

## File Parsing

- CSV → Papa Parse (`/lib/parsers/csv.ts`)
- Excel (.xlsx/.xls) → SheetJS (`/lib/parsers/excel.ts`)
- PDF → pdf-parse (`/lib/parsers/pdf.ts`)
- All parsers normalize output to the `FinancialData` type in `/types/financial.ts`

## AI Pipeline

1. Fetch `parsed_data` from DB
2. Select prompt template from `/lib/ai/prompts.ts` based on `data_type`
3. Call `generateNarrative()` or `streamNarrative()` from `/lib/ai/client.ts`
4. Rate-limit check happens inside `client.ts` before every API call
5. Stream response via Vercel AI SDK `StreamingTextResponse`

## Multi-Tenancy

- Every table has an `organization_id` column
- API routes extract org from the authenticated user's `organization_members` record
- Never trust client-supplied `organization_id` — always derive from session

## Naming Conventions

- Components: PascalCase (`ReportCard.tsx`)
- Hooks: camelCase with `use` prefix (`useUpload.ts`)
- API routes: kebab-case dirs, `route.ts` file
- DB tables: snake_case plural (`report_sections`)
- Types: PascalCase (`FinancialData`)

## Common Commands

```bash
npm run dev          # Start dev server
npm run db:studio    # Open Drizzle Studio
npm run db:generate  # Generate migration from schema changes
npm run db:migrate   # Run pending migrations
npm run typecheck    # Type-check without building
npm run test         # Run Vitest unit tests
```

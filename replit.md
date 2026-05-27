# Veritas&Co

A B2B managed talent infrastructure platform that acts as the legal, financial, and verification bridge between world-class Global South professionals and enterprise clients. Tagline: "Trust is the credential. Not the country."

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/veritas run dev` — run the frontend (dynamic port via workflow)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `SESSION_SECRET` — JWT signing secret
- Optional env: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` — Email configuration
- Optional env: `ADMIN_EMAIL` — Admin notification email (defaults to masmat170290@gmail.com)
- Optional env: `PLATFORM_URL` — Production URL for email links

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + TailwindCSS v4 + shadcn/ui + framer-motion + wouter
- API: Express 5 + JWT authentication (Bearer token)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Email: Nodemailer (SMTP)

## Where things live

- DB schema: `lib/db/src/schema/` (users, professionals, projects, applications, waitlist)
- API spec: `lib/api-spec/openapi.yaml`
- Generated hooks: `lib/api-client-react/src/generated/`
- Generated Zod schemas: `lib/api-zod/src/generated/`
- API routes: `artifacts/api-server/src/routes/`
- Auth logic: `artifacts/api-server/src/lib/auth.ts`
- Email logic: `artifacts/api-server/src/lib/email.ts`
- Frontend pages: `artifacts/veritas/src/pages/`

## Architecture decisions

- JWT Bearer token auth (stored in localStorage on frontend) — stateless, works across domains
- Demand-gated verification: professionals submit applications, admin reviews and approves/rejects
- Trust Score auto-assigned on approval (600-800 range for new approvals)
- Trust Passport has a unique UUID as its public URL — shareable without login
- Admin flag on users table for simple admin access control
- Email notifications sent on: new user, new verification application, approval/rejection

## Product

Veritas&Co is a US-incorporated Delaware C-Corp (Veritas Infrastructure Systems, Inc.) offering:
1. Landing page with waitlist capture
2. Auth: email/password registration with role selection (professional or client)
3. Professional dashboard: Trust Passport display + verification application flow (5-step)
4. Client dashboard: post projects + browse verified talent
5. Public Trust Passport pages at /passport/:passportId
6. Admin panel: review/approve/reject verification applications with email notifications

## User preferences

- No dark mode — light backgrounds only
- Color palette: navy #1E3A5F, gold #C9A84C, white #FFFFFF
- Font: Inter (Google Fonts)
- No emojis in UI
- No Replit/AI branding visible anywhere
- Admin email: masmat170290@gmail.com
- Production-ready — submitted to world-class investors/CEOs

## Gotchas

- Always run `pnpm run typecheck:libs` before `pnpm --filter @workspace/api-server run typecheck`
- After any OpenAPI spec change, run codegen before editing routes
- The DB `portfolioLinks` column is a PostgreSQL array — use `|| []` fallback when reading
- JWT tokens expire in 7d — frontend should handle 401 responses by clearing token and redirecting to /auth
- Admin user must have `is_admin = true` in the database

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details

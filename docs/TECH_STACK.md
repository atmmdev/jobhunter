# TECH_STACK.md

# Job Hunter AI — Tech Stack

## Core

| Technology | Role | Notes |
| ---------- | ---- | ----- |
| **Next.js** (latest App Router) | Web app, API routes, server actions | Server-first |
| **React** | UI | Desktop-first, responsive |
| **TypeScript** | Language | `strict: true`, no `any` |
| **Prisma ORM** | Data access | Migrations required |
| **MySQL** | Primary database | UUID PKs, indexes |
| **TailwindCSS** | Styling | Utility-first |
| **shadcn/ui** | Component system | Clean and flat |
| **Auth.js / NextAuth** | Authentication | Session-based |
| **Zod** | Validation | All boundaries |
| **React Hook Form** | Forms | Paired with Zod resolvers |
| **TanStack Table** | Data grids | Jobs, applications |
| **TanStack Query** | Client async state | When needed |
| **Playwright** | Browser automation + e2e | Reusable browser services |
| **OpenAI API** (or compatible) | AI features | Structured outputs + Zod |

## Supporting Libraries (Expected)

| Library | Purpose |
| ------- | ------- |
| `next-intl` or equivalent | Portuguese / English i18n |
| `date-fns` or `luxon` | Dates |
| `pino` (or similar) | Structured logging |
| `bullmq` / Redis (later) | Job queues |
| `vitest` / `jest` | Unit tests |
| `@playwright/test` | E2E + automation tests |
| `class-variance-authority` | shadcn variants |
| `lucide-react` | Icons (sparingly) |

## Runtime & Tooling

| Tool | Purpose |
| ---- | ------- |
| Node.js LTS | Runtime |
| pnpm or npm | Package manager (pick one; stick to it) |
| ESLint + Prettier | Lint / format |
| Docker Compose | Local MySQL (recommended) |
| GitHub Actions | CI: lint, typecheck, test, migrate check |

## AI Provider Contract

Use an **OpenAI-compatible** client abstraction:

```text
AiClient
  chatStructured<T>(prompt, zodSchema): Promise<T>
  embed(text): Promise<number[]>   # optional later for dedupe/search
```

Supports OpenAI, Azure OpenAI, or compatible gateways via env config.

## Browser Automation Contract

```text
BrowserService
  withContext(fn)
  SiteStrategy.apply(job, resume, coverLetter)
```

Never call Playwright directly from application use cases — always through infrastructure services.

## Environment Variables (Canonical Names)

Document exact keys in `.env.example` during implementation:

| Variable | Purpose |
| -------- | ------- |
| `DATABASE_URL` | MySQL connection |
| `AUTH_SECRET` | Auth.js secret |
| `OPENAI_API_KEY` | AI provider key |
| `OPENAI_BASE_URL` | Optional compatible base URL |
| `OPENAI_MODEL` | Default model |
| `APP_URL` | Public app URL |
| `ENCRYPTION_KEY` | Credential vault encryption |

Never commit real secrets.

## UI Stack Rules

- Dark mode supported
- Desktop-first dashboard
- Minimal, professional, flat shadcn look
- No business logic in UI components
- All user-visible strings go through i18n

## Explicitly Out of Scope (Unless Approved)

- GraphQL (use REST/route handlers/server actions)
- MongoDB as primary store
- Mixing ORMs
- CSS-in-JS as primary styling system
- Hard dependency on a single non-compatible AI vendor API shape

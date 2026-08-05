# Job Hunter AI

Production-ready platform to discover, score, match, and apply to software jobs across ATS platforms, career pages, and community channels — with human approval and (later) Playwright automation.

> This is **not** a demo. Engineering standards: Clean Architecture, TypeScript strict, Zod boundaries, repository/service layers.

---

## Start here (for new users)

**Follow the mini-tutorial:** [`docs/GETTING_STARTED.md`](./docs/GETTING_STARTED.md)

It covers install, Docker/MySQL, seed login, first scrape, and the Jobs → Applications flow.

---

## Quickstart

### 1. Prerequisites

- Node.js 20+ (LTS recommended)
- Docker Desktop (for MySQL)
- npm

### 2. Install

```bash
npm install
npx playwright install chromium
```

### 3. Environment

```bash
cp .env.example .env
```

Set a strong `AUTH_SECRET` in `.env` (for example `openssl rand -base64 32`).

### 4. Database

```bash
docker compose up -d
npm run db:migrate
npm run db:seed
```

Default seed user (from `.env.example`):

- Email: `admin@jobhunter.local`
- Password: `ChangeMe123!`

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000/en/login](http://localhost:3000/en/login) or [http://localhost:3000/pt-BR/login](http://localhost:3000/pt-BR/login).

### Useful scripts

| Script | Purpose |
| ------ | ------- |
| `npm run dev` | Next.js dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm run test` | Unit tests |
| `npm run db:migrate` | Prisma migrate |
| `npm run db:seed` | Seed admin user + default resumes |
| `npm run db:studio` | Prisma Studio |
| `npm run scrape:run-all` | Scrape all enabled supported sources |

---

## Documentation

All project docs live in [`docs/`](./docs/).

| Document | Purpose |
| -------- | ------- |
| [**GETTING_STARTED.md**](./docs/GETTING_STARTED.md) | **Mini-tutorial for new operators / contributors** |
| [MASTER_PROMPT.md](./docs/MASTER_PROMPT.md) | How Cursor / AI agents must think |
| [AGENTS.md](./docs/AGENTS.md) | Specialist agent roster |
| [RULES.md](./docs/RULES.md) | Mandatory project rules |
| [CURSOR_RULES.md](./docs/CURSOR_RULES.md) | Cursor-specific rules |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Clean Architecture & modules |
| [ROADMAP.md](./docs/ROADMAP.md) | Phased delivery plan |
| [PROJECT.md](./docs/PROJECT.md) | Product vision & goals |
| [CONTRIBUTING.md](./docs/CONTRIBUTING.md) | Code & PR standards |
| [TECH_STACK.md](./docs/TECH_STACK.md) | Approved technologies |
| [DATABASE.md](./docs/DATABASE.md) | Schema & data rules |
| [PLAYWRIGHT.md](./docs/PLAYWRIGHT.md) | Browser automation |
| [AI.md](./docs/AI.md) | AI capabilities & contracts |
| [SCRAPERS.md](./docs/SCRAPERS.md) | Crawlers & normalization |
| [ATS.md](./docs/ATS.md) | ATS adapters & detection |
| [TODO.md](./docs/TODO.md) | Living backlog |

Company / board seed lists: [`docs/companies-to-work/`](./docs/companies-to-work/).

---

## Tech Stack

Next.js · React · TypeScript · Prisma · MySQL · TailwindCSS · shadcn/ui · Auth.js · Zod · React Hook Form · TanStack Table/Query · OpenAI-compatible API · Playwright (planned)

See [docs/TECH_STACK.md](./docs/TECH_STACK.md).

---

## Architecture

```text
Presentation → Application → Domain ← Infrastructure
```

Source layout:

```text
src/
  app/                 # Next.js routes (presentation)
  components/          # UI only
  modules/
    domain/
    application/
    infrastructure/
  shared/              # DTOs, Zod, i18n, utils
  workers/             # Background jobs (later)
docs/                  # Project documentation + company seeds
prisma/
```

Details: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

---

## Current Status (approx. **~77%** of full roadmap)

| Phase | Name | Status |
| ----- | ---- | ------ |
| 0 | Foundations | ✅ Complete |
| 1 | Core domain & Jobs/Resumes | ✅ Complete |
| 2 | Company seed & Sources | ✅ Complete |
| 3 | Scrapers P0 (GH/Lever/CUSTOM + CLI) | ✅ Complete |
| 4 | AI enrichment | ✅ Mostly complete |
| 5 | Application workflow (manual) | ✅ Complete |
| 6 | Playwright auto-apply | 🟡 Foundation (+ vault UI; submit off by default) |
| 7 | Expanded sources | 🟡 Partial (~60% — +TeamTailor) |
| 8 | Analytics dashboard | ✅ Mostly complete (metrics live; polish/charts optional) |
| 9 | Hardening / production | 🟡 Early |
| 10 | Advanced intelligence | ❌ Later |

**Usable MVP today:** sync sources → scrape → score → approve → track applications → optional Playwright fill + vaulted sessions.  
**Biggest remaining gaps:** trusted auto-submit, Kenoby/Solides/LinkedIn/Indeed, production queue.

Details: [docs/ROADMAP.md](./docs/ROADMAP.md) · [docs/TODO.md](./docs/TODO.md) · [docs/GETTING_STARTED.md](./docs/GETTING_STARTED.md)

---

## Resumes Supported

| Profile | Stack |
| ------- | ----- |
| JS/TS | React, Next.js, Node, TypeScript |
| .NET | C#, ASP.NET Core |
| PHP | PHP, Laravel, WordPress |

---

## UI Languages

- Portuguese (pt-BR)
- English (en)

---

## Contributing

Read [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md) and [docs/RULES.md](./docs/RULES.md) before opening changes.

New operators: start at [docs/GETTING_STARTED.md](./docs/GETTING_STARTED.md).

---

## License

To be defined by the repository owner.

# AGENTS.md

# Job Hunter AI — AI Agents

Specialist agents (roles) for Cursor and future automation. Each agent owns a bounded context and must follow `MASTER_PROMPT.md`, `RULES.md`, and `ARCHITECTURE.md`.

---

## Agent Roster

| Agent | Owns | Primary docs |
| ----- | ---- | ------------ |
| **Architect Agent** | Boundaries, modules, ADR-level decisions | `ARCHITECTURE.md` |
| **Domain Agent** | Entities, policies, status machines | `ARCHITECTURE.md`, `DATABASE.md` |
| **Backend Agent** | Use cases, APIs, server actions | `ARCHITECTURE.md`, `CONTRIBUTING.md` |
| **Frontend Agent** | Dashboard UI, forms, tables, i18n | `TECH_STACK.md`, `RULES.md` |
| **Database Agent** | Prisma schema, migrations, indexes | `DATABASE.md` |
| **Scraper Agent** | Crawlers, normalization, fixtures | `SCRAPERS.md` |
| **ATS Agent** | ATS adapters and source detection | `ATS.md` |
| **Playwright Agent** | Browser services, auto-apply strategies | `PLAYWRIGHT.md` |
| **AI Agent** | Prompts, structured outputs, scoring/matching | `AI.md` |
| **Auth Agent** | Auth.js, sessions, credential vault | `TECH_STACK.md`, `RULES.md` |
| **Analytics Agent** | Dashboard metrics and aggregations | `PROJECT.md`, `DATABASE.md` |
| **QA Agent** | Unit/integration/e2e, fixtures | `CONTRIBUTING.md` |
| **Docs Agent** | Keep markdown docs synchronized | All docs |
| **DevOps Agent** | Docker, CI, env templates | `TECH_STACK.md` |

---

## Agent Specs

### Architect Agent

**Mission:** Keep Clean Architecture intact.

**Does:**

- Approves module boundaries
- Prevents layer leaks
- Defines interfaces for new capabilities

**Does not:**

- Dump business logic into pages
- Introduce new frameworks without updating `TECH_STACK.md`

---

### Domain Agent

**Mission:** Pure business model.

**Does:**

- Entities, value objects, domain errors
- Scoring/resume selection policies (deterministic parts)
- Status transition rules

**Does not:**

- Import Prisma/Playwright/OpenAI

---

### Backend Agent

**Mission:** Application services and transport adapters.

**Does:**

- Use cases
- DTO mapping
- Authz checks at use-case boundary
- Transaction orchestration

---

### Frontend Agent

**Mission:** Professional dashboard UX.

**Does:**

- shadcn/ui compositions
- React Hook Form + Zod forms
- TanStack Table grids
- TanStack Query where needed
- pt-BR / en strings

**Does not:**

- Embed scoring, scraping, or Prisma

---

### Database Agent

**Mission:** Reliable, normalized MySQL schema.

**Does:**

- Prisma models
- Migrations
- Indexes
- Seed strategies for `docs/companies-to-work/`

---

### Scraper Agent

**Mission:** Discover jobs reliably.

**Does:**

- HTTP/HTML/JSON extractors
- Normalization to `NormalizedJobDto`
- Deduplication hooks
- Fixture-based tests

**Coordinates with:** ATS Agent, AI Agent (for hard pages)

---

### ATS Agent

**Mission:** First-class ATS integrations.

**Owns adapters for:**

- Greenhouse, Lever, Ashby, Workday
- BambooHR, SmartRecruiters, TeamTailor
- Gupy, Kenoby, Solides
- Extensible registry for more

**Does:**

- URL → ATS detection
- API or board scraping strategy selection
- External ID mapping

---

### Playwright Agent

**Mission:** Safe, resilient browser automation.

**Does:**

- `BrowserService`
- Per-site `ApplyStrategy`
- Session/storage isolation
- Failure artifacts
- LinkedIn / Indeed / careers / ATS apply flows

**Does not:**

- Claim success when captcha/login blocks apply

---

### AI Agent

**Mission:** Structured intelligence.

**Does:**

- Job parsing
- Tech/salary extraction
- Resume matching + recommendation explanation
- Job scoring assistance
- Cover letter generation
- Near-duplicate detection assistance

**Rules:**

- Zod-validated outputs only
- Version prompts
- Minimize PII

---

### Auth Agent

**Mission:** Secure access.

**Does:**

- Auth.js configuration
- Protected routes
- Encrypted credential storage references for job boards

---

### Analytics Agent

**Mission:** Decision-grade dashboard.

**Metrics owned:**

- Jobs Found, Applications, Favorites, Rejected
- Interviews, Offers, Response Rate
- Top Technologies, Salary Analytics
- Countries, ATS Statistics

---

### QA Agent

**Mission:** Prevent regressions.

**Does:**

- Unit tests for domain/application
- Integration tests for repositories
- Playwright e2e for critical flows
- Scraper contract tests

---

### Docs Agent

**Mission:** Documentation remains source of truth.

**Does:**

- Update docs with behavior changes
- Keep `TODO.md` / `ROADMAP.md` honest

---

### DevOps Agent

**Mission:** Reproducible environments.

**Does:**

- Docker Compose for MySQL
- CI pipelines
- `.env.example`
- Migration checks in CI

---

## Collaboration Protocol

Typical feature flow:

```text
Architect → Domain → Database → Backend → (Scraper|ATS|AI|Playwright) → Frontend → QA → Docs
```

Parallelize only when interfaces are already agreed.

---

## Handoff Template

When switching agents mid-task, leave:

1. Goal
2. Affected layers/files
3. Open decisions
4. Test status
5. Doc updates still needed

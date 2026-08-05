# ARCHITECTURE.md

# Job Hunter AI — Architecture

## Style

**Clean Architecture** with clear dependency direction:

```
┌─────────────────────────────────────────────┐
│                 Presentation                │
│  Next.js App Router · UI · i18n · Forms     │
└──────────────────────┬──────────────────────┘
                       │ DTOs / Commands / Queries
┌──────────────────────▼──────────────────────┐
│                 Application                 │
│  Use Cases · Services · Orchestration       │
└──────────────────────┬──────────────────────┘
                       │ Domain interfaces
┌──────────────────────▼──────────────────────┐
│                   Domain                    │
│  Entities · Value Objects · Policies        │
│  Repository Interfaces · Domain Errors      │
└──────────────────────▲──────────────────────┘
                       │ Implementations
┌──────────────────────┴──────────────────────┐
│               Infrastructure                │
│  Prisma · Playwright · OpenAI · Auth · Bus  │
└─────────────────────────────────────────────┘
```

**Rule:** outer layers depend inward. Domain never imports Next.js, Prisma, Playwright, or OpenAI SDKs.

---

## Suggested Folder Structure

```text
src/
  app/                          # Presentation (Next.js routes only)
    (auth)/
    (dashboard)/
    api/
    [locale]/
  components/                   # Reusable UI (≤300 lines each)
    ui/                         # shadcn primitives
    jobs/
    applications/
    dashboard/
    resumes/
  modules/
    domain/
      job/
      company/
      application/
      resume/
      scoring/
      notification/
      shared/
    application/
      job/
      scrape/
      score/
      match/
      cover-letter/
      apply/
      analytics/
      notification/
    infrastructure/
      prisma/
      repositories/
      scrapers/
      ats/
      browser/
      ai/
      auth/
      queue/
      mail/
      storage/
  shared/
    dto/
    schemas/                    # Zod
    lib/
    config/
    i18n/
  workers/                      # Background jobs (scrape, score, apply)
prisma/
  schema.prisma
  migrations/
tests/
  unit/
  integration/
  e2e/
docs/                           # Project documentation
  companies-to-work/            # Seed company/board links
```

---

## Layer Responsibilities

### Presentation

- Pages, layouts, dashboard widgets
- Forms (React Hook Form + Zod)
- Tables (TanStack Table)
- Client data fetching (TanStack Query) when needed
- Calls application use cases via server actions or thin API adapters
- **No** scoring rules, scrape logic, or Prisma calls

### Application

- Use cases: `DiscoverJobs`, `ScoreJob`, `MatchResume`, `GenerateCoverLetter`, `ApproveApplication`, `ExecuteAutoApply`, `GetDashboardStats`
- Transaction boundaries and orchestration
- Input/output DTOs
- Mapping between domain and transport shapes

### Domain

- Entities: `Job`, `Company`, `Resume`, `Application`, `Score`, `Technology`, `Source`
- Value objects: `SalaryRange`, `JobStatus`, `Locale`, `AtsType`
- Policies: duplicate detection rules, approval rules, resume selection heuristics (pure)
- Repository **interfaces** only
- Domain errors

### Infrastructure

- Prisma repositories
- ATS adapters (Greenhouse, Lever, Ashby, Workday, SmartRecruiters, BambooHR, Gupy, …)
- Playwright browser service + site strategies
- OpenAI-compatible AI client
- Auth.js adapters
- Notification channels (email, Telegram, in-app)
- Queue / cron workers

---

## Core Flows

### 1. Job Discovery

```text
Scheduler → SourceRegistry → Scraper/ATS Adapter
  → NormalizeJobDto (Zod)
  → UpsertJob (dedupe)
  → Enqueue ScoreJob
```

### 2. Scoring & Matching

```text
ScoreJob
  → Load Job + User Preferences + Resumes
  → AI parse (tech, salary, seniority)
  → Domain scoring policy + AI score
  → Persist JobScore
  → Recommend Resume
  → Notify if above threshold
```

### 3. Application (Human-in-the-loop)

```text
User Approves Job
  → Generate Cover Letter (optional)
  → Create Application (PENDING_APPLY)
  → AutoApply Worker (Playwright strategy)
  → Update status (APPLIED | FAILED | MANUAL_REQUIRED)
  → Audit log + notification
```

### 4. Analytics

```text
Read models / aggregations via Application services
  → Dashboard DTOs
  → Presentation charts/tables
```

---

## Module Boundaries

| Module | Owns |
| ------ | ---- |
| Job | Listing lifecycle, statuses, favorites, rejection |
| Company | Companies, careers URLs, country, ATS type |
| Source | Source definitions, crawl schedule, health |
| Scrape | Extraction pipelines, raw snapshots |
| Score | Scoring models, thresholds, explanations |
| Resume | Resume variants, parse, recommendation |
| Application | Approvals, submissions, outcomes |
| CoverLetter | Generation, templates, versions |
| Browser | Playwright session, strategies, retries |
| AI | Provider client, prompts, structured outputs |
| Analytics | Dashboard aggregations |
| Notification | Channels and preferences |
| Auth | Users, sessions, credentials vault refs |

---

## Cross-Cutting Concerns

| Concern | Approach |
| ------- | -------- |
| Validation | Zod at every external boundary |
| Errors | Typed domain/application errors → HTTP/UI mapping |
| Logging | Structured logs with correlation IDs per scrape/apply |
| Secrets | Env + encrypted credential store for ATS/job-board logins |
| i18n | Locale-aware presentation; domain stores language codes |
| Idempotency | Dedupe keys on job external IDs + content hash |
| Rate limiting | Per-source concurrency + backoff |
| Observability | Job run metrics, failure taxonomies |

---

## Data Ownership

- **Source of truth for jobs:** normalized Domain entities in MySQL via Prisma
- **Raw HTML/JSON:** stored as scrape artifacts for audit/replay, not queried as primary model
- **AI outputs:** persisted with model/version metadata for reproducibility

---

## Security Architecture

- Auth.js for session management
- Role-ready user model (single-user first, multi-user later)
- Never log passwords, cookies, or full resume PII unnecessarily
- Playwright storage state isolated per provider account
- Server-only modules for secrets and browser automation

---

## Scaling Strategy

| Phase | Approach |
| ----- | -------- |
| v1 | Next.js app + Prisma MySQL + cron workers in-process or simple queue |
| v2 | Extract workers to dedicated process; add Redis queue |
| v3 | Horizontal scrape workers; per-ATS rate limiters; read replicas for analytics |

Keep interfaces stable so infrastructure can change without rewriting domain/application.

---

## Testing Architecture

| Layer | Test type |
| ----- | --------- |
| Domain policies | Pure unit tests |
| Application use cases | Unit with mocked repositories |
| Repositories | Integration tests against MySQL |
| Scrapers/ATS | Contract tests + fixture HTML/JSON |
| Auto-apply | Playwright e2e against fixtures / staging |
| UI critical paths | Playwright e2e |

---

## Anti-Patterns (Reject in Review)

- Prisma client imported in React components
- Business rules inside `page.tsx`
- God scrapers with hardcoded site-specific logic mixed into use cases
- Shared mutable browser context across concurrent applies
- Untyped AI JSON parsing without Zod

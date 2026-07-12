# RULES.md

# Job Hunter AI — Project Rules

These rules are mandatory for humans and AI agents.

---

## 1. Architecture Rules

1. Follow Clean Architecture at all times.
2. Never put business logic in pages or React components.
3. Never import Prisma, Playwright, or AI SDKs from Presentation.
4. Domain must not depend on frameworks.
5. Application orchestrates; Infrastructure implements.
6. Every feature starts with interfaces + DTOs + Zod schemas.

---

## 2. TypeScript Rules

1. `strict` mode always enabled.
2. Never use `any`.
3. Prefer `unknown` + narrowing over loose types.
4. Export types for all public contracts.
5. Prefer `readonly` and immutable data at boundaries.
6. Discriminated unions for status machines (`JobStatus`, `ApplicationStatus`).

---

## 3. DTO & Validation Rules

1. Always use DTOs between layers.
2. Always validate external input with Zod:
   - HTTP request bodies/query
   - Scraper/ATS payloads
   - AI structured outputs
   - Env config
3. Never trust AI JSON without schema parse.
4. Map validation errors to typed application errors.

---

## 4. Repository & Service Rules

1. Always use Repository Pattern for persistence.
2. Always use Service / Use Case layer for orchestration.
3. Repositories return domain entities or persistence models mapped at the boundary — never leak Prisma types into Presentation.
4. One repository per aggregate root (Job, Company, Application, Resume, …).
5. No raw SQL unless absolutely necessary and documented.

---

## 5. Database Rules

1. Prisma + migrations only.
2. UUID primary keys.
3. Normalize tables.
4. Add indexes for frequent filters/sorts (status, source, companyId, createdAt, score).
5. Soft-delete only when business requires audit continuity.
6. Every schema change includes a migration and `DATABASE.md` update when structural.

---

## 6. UI Rules

1. shadcn/ui + TailwindCSS.
2. Clean, flat, professional dashboard.
3. Dark mode supported.
4. Desktop-first, responsive.
5. Reusable components only — no one-off copy/paste blocks.
6. Components ≤ **300 lines**.
7. Files ≤ **500 lines**.
8. Forms: React Hook Form + Zod.
9. Tables: TanStack Table.
10. Client async: TanStack Query when needed.
11. All UI strings: Portuguese + English via i18n.

---

## 7. Playwright Rules

1. Automation only through reusable browser services.
2. Never hardcode brittle selectors in use cases.
3. Prefer resilient locators (roles, labels, test ids, stable attributes).
4. Isolate browser contexts per run.
5. Implement retries + exponential backoff for transient failures.
6. On unsupported pages, set status `MANUAL_REQUIRED` — never fake success.
7. Record failure screenshots/HTML snapshots for debugging (no secrets).

---

## 8. Scraper / ATS Rules

1. One adapter per ATS family when possible.
2. Normalize to a shared `NormalizedJobDto`.
3. Persist source metadata and external IDs.
4. Deduplicate before insert/update.
5. Respect rate limits and robots/legal constraints.
6. Seed URLs from `docs/companies-to-work/` and Source registry.
7. Scrapers must be testable with fixtures.

---

## 9. AI Rules

1. Use AI for: parsing, matching, scoring, cover letters, salary/tech extraction, duplicate hints.
2. Always request structured output validated by Zod.
3. Persist model name, prompt version, and raw response reference when useful for audit.
4. Domain policies may combine AI score + deterministic rules.
5. Never send secrets or unnecessary PII to the model.

---

## 10. Resume Rules

1. Support multiple resumes.
2. Profiles include at least:
   - React / Next.js / Node / TypeScript
   - C# / ASP.NET Core
   - PHP / Laravel / WordPress
3. Always recommend the best resume for a job.
4. Recommendation must be explainable (tech overlap, keywords, seniority).

---

## 11. Application Workflow Rules

1. Manual approval required before auto-apply (default).
2. Track every transition with timestamps and actor (`user` | `system`).
3. Cover letters are versioned per application attempt.
4. Failed applies must store reason codes.

---

## 12. Quality Rules

1. Prefer readability over cleverness.
2. No duplicated logic — extract shared modules.
3. Always create interfaces for swappable infrastructure.
4. Document all exported functions (JSDoc / TSDoc).
5. Update docs when behavior changes.
6. Incomplete implementations are not acceptable for claimed features.

---

## 13. Security Rules

1. Never commit `.env` or credentials.
2. Encrypt stored job-board credentials at rest.
3. Auth required for all dashboard/API mutations.
4. Sanitize logged URLs and payloads.

---

## 14. Git / Delivery Rules

1. Small, focused changes.
2. Meaningful commit messages.
3. Do not push or create PRs unless asked.
4. CI must pass: typecheck, lint, tests.

---

## 15. Documentation Rules

Keep these files accurate:

- `docs/MASTER_PROMPT.md`
- `docs/AGENTS.md`
- `docs/RULES.md`
- `docs/CURSOR_RULES.md`
- `docs/ARCHITECTURE.md`
- `docs/ROADMAP.md`
- `docs/PROJECT.md`
- `docs/CONTRIBUTING.md`
- `docs/TECH_STACK.md`
- `docs/DATABASE.md`
- `docs/PLAYWRIGHT.md`
- `docs/AI.md`
- `docs/SCRAPERS.md`
- `docs/ATS.md`
- `docs/TODO.md`
- `docs/companies-to-work/`

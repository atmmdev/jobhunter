# CURSOR_RULES.md

# Cursor-Specific Rules for Job Hunter AI

These rules specialize `RULES.md` and `MASTER_PROMPT.md` for Cursor agents.

---

## How to Start Any Task

1. Read `docs/MASTER_PROMPT.md` if context is cold.
2. Read the relevant domain doc (`docs/DATABASE.md`, `docs/AI.md`, `docs/PLAYWRIGHT.md`, `docs/SCRAPERS.md`, `docs/ATS.md`).
3. Identify owning agent from `docs/AGENTS.md`.
4. Implement in the correct Clean Architecture layer.
5. Add/adjust tests and update docs/TODO as needed.

---

## Cursor Behavior Requirements

### Always

- Think as a Senior Staff Engineer.
- Prefer production-ready, complete implementations.
- Use TypeScript strict patterns.
- Create interfaces before implementations.
- Validate with Zod at boundaries.
- Keep components ≤ 300 lines and files ≤ 500 lines.
- Explain architecture decisions briefly when implementing features.
- Reuse existing patterns in the repo once code exists.

### Never

- Never use `any`.
- Never put business logic in `app/**/page.tsx` or presentational components.
- Never call Prisma from UI components.
- Never hardcode Playwright selectors in random files.
- Never invent incomplete stubs for a feature marked done.
- Never delete or rewrite docs without cause.
- Never commit secrets.
- Never push, force-push, or open PRs unless the user asks.

---

## Implementation Checklist (Feature PR / Change)

Copy this mentally for every feature:

- [ ] Domain types / entities updated
- [ ] Zod schemas added/updated
- [ ] DTOs defined
- [ ] Repository interface + Prisma implementation (if persistence)
- [ ] Application service / use case
- [ ] Presentation wiring (server action / route + UI)
- [ ] i18n keys (pt-BR + en)
- [ ] Indexes/migrations if schema changed
- [ ] Unit/integration/e2e tests as applicable
- [ ] `TODO.md` / `ROADMAP.md` status updated

---

## File Placement Cheat Sheet

| If you are building… | Put it in… |
| -------------------- | ---------- |
| Entity / policy | `src/modules/domain/...` |
| Use case | `src/modules/application/...` |
| Prisma repo / scraper / AI client | `src/modules/infrastructure/...` |
| Page / layout | `src/app/...` |
| Reusable UI | `src/components/...` |
| Shared Zod / DTO | `src/shared/...` |
| Worker | `src/workers/...` |

---

## Prompting Self-Check Before Coding

Ask:

1. Which layer owns this change?
2. What is the use case name?
3. What can fail externally?
4. How is it tested?
5. Does UI need i18n?

If any answer is unclear, read architecture docs first — do not guess.

---

## Refactoring Policy

- Extract when a file approaches size limits.
- Do not drive-by refactor unrelated modules.
- Preserve public interfaces when possible; version changes intentionally.

---

## Working with `docs/companies-to-work/`

- Treat markdown tables as **seed input**, not runtime source of truth.
- Import into `Company` / `Source` tables via a seed or sync use case.
- Detect ATS type from URL patterns when possible (`jobs.lever.co`, `boards.greenhouse.io`, `*.wd*.myworkdayjobs.com`, `*.gupy.io`, etc.).

---

## Preferred Response Shape When Implementing

1. Short reasoning / architecture decision
2. Code changes
3. Tests
4. Doc updates
5. How to verify locally

Keep the user-facing summary concise; put depth in code and docs.

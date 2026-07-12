# CONTRIBUTING.md

# Contributing to Job Hunter AI

## Principles

Write code as if the next engineer is a Senior Staff hire reviewing for production readiness.

Follow:

- `MASTER_PROMPT.md`
- `RULES.md`
- `CURSOR_RULES.md`
- `ARCHITECTURE.md`
- `TECH_STACK.md`

---

## Development Setup (Target)

1. Clone the repository
2. Copy `.env.example` → `.env` and fill secrets
3. Start MySQL (Docker Compose recommended)
4. Install dependencies
5. Run Prisma migrate + generate
6. Seed companies from `docs/companies-to-work/` when seed command exists
7. Start the Next.js app
8. Run workers if separate from the web process

Exact commands will live in root `README.md` once the app is bootstrapped.

---

## Branching

| Branch | Purpose |
| ------ | ------- |
| `main` | Production-ready |
| `feat/*` | Features |
| `fix/*` | Bug fixes |
| `chore/*` | Tooling/docs |
| `refactor/*` | Internal restructuring |

---

## Commit Messages

Prefer concise, imperative subjects focused on **why**:

```text
feat(jobs): add dedupe by externalId and contentHash
fix(apply): mark Workday captcha as MANUAL_REQUIRED
docs(architecture): clarify worker boundaries
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`, `db`.

---

## Code Style

### TypeScript

- Strict mode
- No `any`
- Explicit return types on exported functions
- TSDoc on exported functions/classes

### Naming

| Kind | Convention |
| ---- | ---------- |
| Components | `PascalCase` |
| Hooks | `useCamelCase` |
| Use cases | `VerbNoun` (`ScoreJob`, `ApproveApplication`) |
| Repositories | `XxxRepository` + `PrismaXxxRepository` |
| Zod schemas | `xxxSchema` + inferred `XxxDto` |
| Prisma models | `PascalCase` |

### File size

- Components ≤ 300 lines
- Files ≤ 500 lines
- Split by responsibility early

### Imports

- Prefer absolute aliases (`@/modules/...`, `@/shared/...`)
- Domain must not import infrastructure

---

## Layer Checklist for PRs

A typical feature PR should show:

1. Domain changes (if any)
2. Zod schemas / DTOs
3. Application use case
4. Infrastructure implementation
5. Presentation wiring
6. Tests
7. Docs / TODO updates

UI-only PRs are allowed only when no domain/application change is required.

---

## Testing Expectations

| Change type | Minimum tests |
| ----------- | ------------- |
| Domain policy | Unit |
| Use case | Unit with mocks |
| Repository / migration behavior | Integration |
| Scraper/ATS adapter | Fixture contract test |
| Auto-apply strategy | Playwright test against fixture page when feasible |
| Dashboard critical path | E2E smoke |

Do not merge knowingly broken tests.

---

## Documentation Expectations

Update the relevant doc whenever you change:

- Schema → `DATABASE.md`
- ATS support → `ATS.md`
- Scraper approach → `SCRAPERS.md`
- Automation → `PLAYWRIGHT.md`
- Prompts/scoring → `AI.md`
- Priority/backlog → `TODO.md` / `ROADMAP.md`

---

## PR Description Template

```markdown
## Summary
- What and why

## Architecture
- Layers/modules touched

## Test plan
- [ ] Unit/integration/e2e as applicable
- [ ] Manual verification steps

## Docs
- [ ] Updated relevant markdown files
```

---

## Review Bar

Reject if:

- Business logic in UI
- `any` introduced
- Missing Zod validation at a new boundary
- Missing migration for schema change
- Hardcoded brittle selectors without strategy abstraction
- Incomplete feature marked as done
- Secrets committed

---

## Security Notes for Contributors

- Never commit real cookies, storage states, or API keys
- Use local-only files (gitignored) for Playwright auth state
- Prefer redacted fixtures in tests

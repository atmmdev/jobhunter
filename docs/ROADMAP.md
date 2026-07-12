# ROADMAP.md

# Job Hunter AI — Roadmap

Phased delivery toward a production-ready system. Each phase must be shippable and documented.

---

## Phase 0 — Foundations (Docs & Bootstrap)

**Status:** Complete

- [x] Master documentation set
- [x] Next.js + TypeScript strict + Tailwind + shadcn/ui
- [x] Prisma + MySQL + initial migrations
- [x] Auth.js baseline (credentials + JWT)
- [x] Clean Architecture folder skeleton
- [x] ESLint/Prettier (+ CI workflow)
- [x] `.env.example` + Docker Compose MySQL
- [x] i18n shell (pt-BR / en)

**Exit criteria:** App boots, user can sign in, empty dashboard renders in both locales. ✅

---

## Phase 1 — Core Domain & Jobs CRUD

**Status:** Complete

- [x] Prisma models per `DATABASE.md`
- [x] Repositories + use cases for Job/Company/Source/Resume
- [x] Manual job create/edit (create + status triage)
- [x] Jobs table (TanStack Table) with filters/status
- [x] Favorites / Reject flows
- [x] Resume upload + multi-resume management (contentText create/list/delete)

**Exit criteria:** Operator can manage resumes and manually curated jobs end-to-end. ✅

---

## Phase 2 — Company Seed & Source Registry

**Status:** Mostly complete (ScrapeRun history UI deferred to Phase 3)

- [x] Parse/sync `docs/companies-to-work/` → Company/Source
- [x] ATS URL detection (`ATS.md`) + unit tests
- [x] Sources listing UI + sync from markdown
- [ ] Source enable/disable toggle
- [ ] ScrapeRun history UI

**Exit criteria:** Companies imported; sources visible and manageable. ✅ (history/toggle pending)

---

## Phase 3 — Scrapers & ATS Discovery (P0)

- [ ] Adapter registry + normalization pipeline
- [ ] Greenhouse adapter
- [ ] Lever adapter
- [ ] Generic careers HTML adapter (best-effort)
- [ ] Deduplication (externalId + contentHash)
- [ ] Scheduler / manual “Run source”

**Exit criteria:** Real jobs flowing from at least 2 ATS families into the DB.

---

## Phase 4 — AI Enrichment

- [ ] AiClient abstraction (OpenAI-compatible)
- [ ] Parse job / extract tech / extract salary
- [ ] Hybrid scoring + JobScore persistence
- [ ] Resume recommendation
- [ ] Cover letter generation (pt-BR / en)
- [ ] Notifications for high-score jobs

**Exit criteria:** New jobs auto-score; best resume recommended; cover letter editable.

---

## Phase 5 — Application Workflow

- [ ] Approval queue
- [ ] Application state machine
- [ ] Manual mark as applied
- [ ] Audit log of transitions
- [ ] Basic notifications (in-app)

**Exit criteria:** Human-in-the-loop apply tracking works without Playwright.

---

## Phase 6 — Playwright Auto-Apply (P0/P1)

- [ ] BrowserService
- [ ] Greenhouse / Lever apply strategies
- [ ] Careers fallback strategy
- [ ] Failure artifacts + `MANUAL_REQUIRED`
- [ ] Credential vault for sessions

**Exit criteria:** Approved jobs can auto-apply on supported ATS with safe failure modes.

---

## Phase 7 — Expanded Sources

- [ ] Ashby, Workday, Gupy adapters
- [ ] BambooHR, SmartRecruiters, TeamTailor
- [ ] Kenoby, Solides
- [ ] LinkedIn / Indeed (cautious)
- [ ] Catho / APInfo
- [ ] Telegram + Slack ingest

**Exit criteria:** Coverage matches product source list at MVP breadth.

---

## Phase 8 — Analytics Dashboard

- [ ] Jobs Found, Applications, Favorites, Rejected
- [ ] Interviews, Offers, Response Rate
- [ ] Top Technologies
- [ ] Salary Analytics
- [ ] Countries
- [ ] ATS Statistics

**Exit criteria:** Dashboard metrics match `PROJECT.md` requirements.

---

## Phase 9 — Hardening & Production

- [ ] Queue workers (Redis/BullMQ or equivalent)
- [ ] Rate limiters & observability dashboards
- [ ] Backup/restore docs
- [ ] Security review (secrets, authz)
- [ ] Performance pass on heavy tables
- [ ] E2E suite in CI

**Exit criteria:** Production deployment checklist complete.

---

## Phase 10 — Advanced Intelligence (Later)

- [ ] Embeddings search / semantic dedupe
- [ ] Preference learning from accept/reject
- [ ] Evaluation harness for scoring quality
- [ ] Multi-user / teams (if needed)

---

## Priority Legend

| Tag | Meaning |
| --- | ------- |
| P0 | Must ship for usable MVP |
| P1 | Important shortly after MVP |
| P2 | Expand coverage |
| P3 | Nice-to-have / opportunistic |

---

## Current Focus

1. Phase 3 Greenhouse + Lever discovery
2. ScrapeRun history UI
3. Phase 4 AI enrichment

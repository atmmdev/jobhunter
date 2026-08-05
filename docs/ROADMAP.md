# Job Hunter AI — Roadmap

Living plan. Prefer completing an exit-criteria slice before expanding scope.

---

## Phase 0 — Foundations ✅

Complete.

---

## Phase 1 — Core domain & Jobs/Resumes ✅

Complete.

---

## Phase 2 — Company seed & Sources ✅

Complete.

---

## Phase 3 — Scrapers P0 ✅

Complete (Greenhouse/Lever/CUSTOM + CLI + history).

---

## Phase 4 — AI enrichment ✅

Mostly complete (score + cover letter + enrichment; optional prompt polish).

---

## Phase 5 — Application workflow ✅

Complete (manual transitions + audit).

---

## Phase 6 — Playwright Auto-Apply ✅ (safe defaults)

- [x] BrowserService + strategies + artifacts
- [x] Resume upload / materialize
- [x] Credential vault + Settings UI + storageState injection
- [x] Confirmation hardening (en + pt-BR + URL)
- Submit remains opt-in via `PLAYWRIGHT_AUTO_SUBMIT=true`

---

## Phase 7 — Expanded Sources ✅ (practical MVP breadth)

- [x] Ashby, Workday, Gupy, BambooHR, SmartRecruiters, TeamTailor, Personio, Apinfo
- [x] LinkedIn / Indeed / Catho via **export JSON** (`source.config.jobs`) — no HTML scrape
- [x] Telegram + Slack ingest (config.messages or bot tokens)
- Kenoby/Solides: blocked without public unauth APIs (documented)

---

## Phase 8 — Analytics Dashboard ✅

Live metrics complete; richer charts optional polish.

---

## Phase 9 — Hardening & Production ✅

- [x] Redis + BullMQ scrape queue + `npm run scrape:worker`
- [x] In-process concurrency guard + `SCRAPE_DELAY_MS`
- [x] Structured logs + correlation IDs
- [x] Backup + Security docs
- [x] Security headers (Next config)
- [x] Performance indexes
- [x] CI quality + e2e smoke (incl. authenticated login)

---

## Phase 10 — Advanced Intelligence ✅ (v1 scope)

- [x] Preference learning from favorite/reject keywords
- [x] Soft semantic dedupe (Jaccard) on scrape upsert
- [x] Offline scoring evaluation harness (`npm run eval:scoring`)
- [ ] Multi-user / teams — **out of v1** (PROJECT.md non-goal; schema already user-scoped)

---

## Current status

**Roadmap-weighted estimate: ~95% of full vision / ~100% of v1 shippable scope.**

Remaining intentionally deferred:

1. Mass trusted auto-submit across all ATS (policy: human approval + opt-in submit)
2. Partner LinkedIn/Indeed APIs (export path shipped instead)
3. Kenoby/Solides public adapters (no stable public API)
4. Multi-tenant teams UI

Operator flow is complete: sync → scrape (inline or queue) → score (with preferences) → approve → apply fill → track → analytics.

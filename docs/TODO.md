# TODO.md

# Job Hunter AI — Backlog

Living backlog. Check items off as they ship. Aligns with `ROADMAP.md`.

---

## Now (Phase 3)

### Phase 1–2 highlights — done

- [x] Jobs / Resumes / Sources sync + pagination/sort
- [x] Seed 3 default resumes (JS_TS, DOTNET, PHP)

### Phase 3 — Scraping P0

- [x] `JobSourceAdapter` + registry
- [x] Greenhouse adapter
- [x] Lever adapter
- [x] Normalize + upsert pipeline + ScrapeRun
- [x] Manual “Run” action on Sources
- [x] ScrapeRun history on Sources page
- [x] Source enable/disable toggle action
- [x] Generic careers adapter (CUSTOM)
- [x] Cron/scheduler entrypoint (`npm run scrape:run-all`)
- [x] Apinfo adapter (recent jobs from homepage)
- [x] Ashby adapter (public board API)
- [x] Gupy adapter (career page SSR `__NEXT_DATA__`)

---

## Next (Phase 2–3)

### Companies & Sources

- [x] Markdown parser for `docs/companies-to-work/*.md`
- [x] `SyncCompaniesFromMarkdown` use case
- [x] ATS detection heuristics + unit tests
- [x] Sources admin page
- [x] ScrapeRun history (Sources page section)
- [ ] Dedicated ScrapeRun history page (optional)

### Scraping P0

- [x] `JobSourceAdapter` + registry
- [x] Greenhouse adapter + fixtures
- [x] Lever adapter + fixtures
- [x] Generic careers adapter + fixtures
- [x] Normalize + dedupe pipeline
- [x] Manual “Run now” action
- [x] Cron/scheduler entrypoint

---

## AI (Phase 4)

- [x] `AiClient` OpenAI-compatible implementation
- [x] Prompts v1: score, cover letter + deterministic tech/salary extract
- [x] Score job (deterministic + optional AI) + Jobs UI
- [x] Recommend resume use case (via score)
- [x] Cover letter generation + Applications UI editor
- [x] High-score notification
- [x] Dashboard live metrics from DB
- [ ] Full AI parse/tech/salary prompts (optional refinement)
---

## Applications (Phase 5–6)

- [x] Approval queue UI
- [x] Application status machine + audit log
- [x] Manual applied / interview / offer transitions
- [ ] `BrowserService`
- [ ] Greenhouse apply strategy
- [ ] Lever apply strategy
- [ ] Careers apply strategy (best-effort)
- [ ] Credential vault encryption
- [ ] Failure artifacts storage

---

## Expanded coverage (Phase 7)

- [x] Ashby adapter
- [ ] Workday adapter
- [x] Gupy adapter (career SSR listing)
- [ ] BambooHR / SmartRecruiters / TeamTailor adapters
- [ ] Kenoby / Solides adapters
- [ ] LinkedIn discovery (careful)
- [ ] Indeed discovery (careful)
- [ ] Catho adapter
- [x] APInfo adapter (homepage recent jobs)
- [ ] Telegram source ingest
- [ ] Slack source ingest

---

## Analytics (Phase 8)

- [ ] Jobs Found metric
- [ ] Applications metric
- [ ] Favorites / Rejected metrics
- [ ] Interviews / Offers metrics
- [ ] Response Rate calculation
- [ ] Top Technologies chart
- [ ] Salary Analytics
- [ ] Countries breakdown
- [ ] ATS Statistics panel

---

## Hardening (Phase 9)

- [ ] Background queue (BullMQ/Redis or equivalent)
- [ ] Rate limit per source
- [ ] Structured logs + correlation IDs
- [ ] CI: lint, typecheck, unit, e2e smoke
- [ ] Backup documentation
- [ ] Security pass on secrets & authz
- [ ] Performance indexes review

---

## Later (Phase 10)

- [ ] Embeddings / semantic search
- [ ] Learning from accept/reject feedback
- [ ] Offline scoring evaluation harness
- [ ] Multi-user support

---

## Bugs

_None yet — track here after implementation starts._

---

## Decisions Needed

- [x] Package manager: npm
- [x] Auth provider(s) for v1: Credentials (email/password) + JWT
- [ ] File storage for resumes/artifacts: local vs S3-compatible
- [ ] Queue technology timing (Phase 0 in-process vs early Redis)

---

## Doc Debt

- [ ] Keep this file updated every phase
- [ ] Add ADRs folder if architectural decisions multiply

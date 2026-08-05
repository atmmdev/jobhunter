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
- [x] Sources name search filter
- [x] Refresh remote job boards in `worldwide.md` (We Work Remotely, Remote.com, Workana, etc.; skip dead/redundant)
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
- [x] `BrowserService` (Playwright)
- [x] Greenhouse apply strategy (fill + safe MANUAL_REQUIRED by default)
- [x] Lever apply strategy (fill + safe MANUAL_REQUIRED by default)
- [x] Careers apply strategy (best-effort)
- [x] Failure artifacts storage (`storage/artifacts/apply/…`)
- [x] Resume file upload into ATS forms (materialize `.txt` from contentText when needed)
- [x] Credential vault encryption helpers (AES-256-GCM + Prisma repository)
- [x] UI to save provider storage-state into vault (Settings)
- [x] Auto-apply injects vaulted storage-state into Playwright context
- [ ] Auto-submit confirmation hardening (`PLAYWRIGHT_AUTO_SUBMIT`)

---

## Expanded coverage (Phase 7)

- [x] Ashby adapter
- [x] Workday adapter (CXS public JSON)
- [x] Gupy adapter (career SSR listing)
- [x] BambooHR adapter (careers/list + `/careers/{id}/detail`)
- [x] SmartRecruiters adapter (public company postings API)
- [x] TeamTailor adapter (public `/jobs.json` JSON Feed)
- [ ] Kenoby / Solides adapters
- [ ] LinkedIn discovery (careful)
- [ ] Indeed discovery (careful)
- [ ] Catho adapter
- [x] APInfo adapter (homepage recent jobs)
- [ ] Telegram source ingest
- [ ] Slack source ingest

---

## Analytics (Phase 8)

- [x] Jobs Found metric
- [x] Applications metric
- [x] Favorites / Rejected metrics
- [x] Interviews / Offers metrics
- [x] Response Rate calculation
- [x] Top Technologies (dashboard summary)
- [x] Salary Analytics (avg min/max)
- [x] Countries breakdown
- [x] ATS Statistics panel
- [ ] Richer charts / dedicated analytics page (optional polish)

---

## Hardening (Phase 9)

- [ ] Background queue (BullMQ/Redis or equivalent)
- [ ] Rate limit per source
- [ ] Structured logs + correlation IDs
- [x] CI workflow baseline
- [ ] CI: e2e smoke
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

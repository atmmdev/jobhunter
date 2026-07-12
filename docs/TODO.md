# TODO.md

# Job Hunter AI — Backlog

Living backlog. Check items off as they ship. Aligns with `ROADMAP.md`.

---

## Now (Phase 2)

### Phase 1 — Jobs & Resumes — done

- [x] Repository interfaces for Job, Company, Resume, Source
- [x] Jobs list page (TanStack Table) with filters/status
- [x] Manual job create
- [x] Favorites / Reject / Restore flows
- [x] Resumes list + create form (RHF + Zod)
- [x] Resume contentText management + delete

### Phase 2 — Companies & Sources

- [x] Markdown parser for `docs/companies-to-work/*.md`
- [x] `SyncCompaniesFromMarkdown` use case
- [x] ATS detection heuristics + unit tests
- [x] Sources admin page (+ sync button)
- [ ] ScrapeRun history page
- [ ] Source enable/disable toggle action

---

## Next (Phase 2–3)

### Companies & Sources

- [ ] Markdown parser for `docs/companies-to-work/*.md`
- [ ] `SyncCompaniesFromMarkdown` use case
- [ ] ATS detection heuristics + unit tests
- [ ] Sources admin page
- [ ] ScrapeRun history page

### Scraping P0

- [ ] `JobSourceAdapter` + registry
- [ ] Greenhouse adapter + fixtures
- [ ] Lever adapter + fixtures
- [ ] Generic careers adapter
- [ ] Normalize + dedupe pipeline
- [ ] Manual “Run now” action
- [ ] Cron/scheduler entrypoint

---

## AI (Phase 4)

- [ ] `AiClient` OpenAI-compatible implementation
- [ ] Prompts v1: parse, tech, salary, score, match, cover letter
- [ ] Score job worker
- [ ] Recommend resume use case
- [ ] Cover letter UI editor
- [ ] High-score notification

---

## Applications (Phase 5–6)

- [ ] Approval queue UI
- [ ] Application status machine + audit log
- [ ] Manual applied / interview / offer transitions
- [ ] `BrowserService`
- [ ] Greenhouse apply strategy
- [ ] Lever apply strategy
- [ ] Careers apply strategy (best-effort)
- [ ] Credential vault encryption
- [ ] Failure artifacts storage

---

## Expanded coverage (Phase 7)

- [ ] Ashby adapter
- [ ] Workday adapter
- [ ] Gupy adapter + apply strategy
- [ ] BambooHR / SmartRecruiters / TeamTailor adapters
- [ ] Kenoby / Solides adapters
- [ ] LinkedIn discovery (careful)
- [ ] Indeed discovery (careful)
- [ ] Catho / APInfo adapters
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

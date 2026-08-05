# TODO.md

# Job Hunter AI — Backlog

Living backlog. Aligns with `ROADMAP.md`.

---

## Shipped (Phases 0–10 v1)

- [x] Core app, sources, scrapers P0–P7 practical coverage
- [x] AI score/cover letter + preference learning
- [x] Applications + Playwright fill + vault
- [x] Analytics dashboard
- [x] Redis/BullMQ scrape queue + worker
- [x] E2E smoke + security headers/docs + backup docs
- [x] Telegram/Slack ingest + LinkedIn/Indeed/Catho export JSON
- [x] Soft semantic dedupe + scoring eval harness
- [x] In-app Help / Ajuda page (sidebar below Settings)
- [x] Dashboard focus countries panel (EU/Oceania/NA/SA+Brazil/Asia/ME)

---

## Deferred / out of v1

- [ ] Multi-user teams UI
- [ ] Partner LinkedIn/Indeed APIs
- [ ] Kenoby/Solides public adapters (blocked)
- [ ] Unsupervised mass auto-submit

---

## Bugs

- [x] CI `quality` job red: `package-lock.json` still listed `prisma` under `devDependencies` after it moved to `dependencies`, so `npm ci` aborted
- [x] CI `quality` job missing `DATABASE_URL` for `npx prisma validate` (env is now set at job level)
- [x] Login form declared `method="post"`, so an un-hydrated page submitted natively and silently discarded the sign-in
- [x] Dev server blocked `127.0.0.1` HMR as a cross-origin dev resource, preventing hydration during local Playwright runs

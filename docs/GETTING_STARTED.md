# Getting Started — Job Hunter AI

Mini-tutorial for developers who want to run and use the app locally.

For architecture and contribution rules, see [`ARCHITECTURE.md`](./ARCHITECTURE.md) and [`CONTRIBUTING.md`](./CONTRIBUTING.md).  
For phase progress, see [`ROADMAP.md`](./ROADMAP.md).

---

## What you get today

A dashboard to:

1. Import company / job-board sources from markdown
2. Scrape jobs from supported ATS / boards
3. Score jobs against your resumes and generate cover letters
4. Track applications (approve → applied → interview → offer)
5. Optional Playwright **auto-fill** on apply pages (submit off by default)

### Runnable scrapers (Sources → Run)

| ATS / source | Notes |
| ------------ | ----- |
| Greenhouse | Public board API |
| Lever | Public postings API |
| Ashby | Public board API |
| Gupy | Career page SSR (`__NEXT_DATA__`) |
| Apinfo | Homepage recent jobs (Windows-1252) |
| Workday | Public CXS JSON (`*.myworkdayjobs.com`) |
| SmartRecruiters | Public postings API |
| BambooHR | Public careers/list JSON |
| TeamTailor | Public `/jobs.json` feed |
| Personio | Public XML board (`*.jobs.personio.de|com/xml`) |
| CUSTOM | Generic HTML careers fallback |

**Not ready yet:** Kenoby / Solides / Catho (no stable public API or strong anti-bot), LinkedIn / Indeed discovery, Telegram/Slack ingest, trusted auto-submit at scale, production Redis queue.

---

## Prerequisites

- **Node.js 20+** (LTS)
- **Docker Desktop** (MySQL 8)
- **npm**
- Optional: OpenAI-compatible API key (scoring / cover letters with AI)
- Optional (auto-apply): Chromium via Playwright

---

## 1. Clone and install

```bash
git clone <your-repo-url> jobhunter
cd jobhunter
npm install
npx playwright install chromium
```

Wait until `npm install` finishes successfully (it also runs `prisma generate`).  
**Do not** run `db:migrate` before this step — without `node_modules`, Windows shows `'prisma' não é reconhecido`.

---

## 2. Environment

```bash
cp .env.example .env
```

Edit `.env` and set at least:

| Variable | Required | Notes |
| -------- | -------- | ----- |
| `AUTH_SECRET` | yes | `openssl rand -base64 32` |
| `DATABASE_URL` | yes | Default matches Docker Compose |
| `SEED_USER_EMAIL` / `SEED_USER_PASSWORD` | yes | First login |
| `OPENAI_API_KEY` | optional | Without it, scoring still works (deterministic) |
| `OPENAI_BASE_URL` / `OPENAI_MODEL` | optional | Defaults in `.env.example` |
| `PLAYWRIGHT_AUTO_APPLY_ENABLED` | optional | Default `true` |
| `PLAYWRIGHT_HEADLESS` | optional | Default `true` (set `false` to watch the browser) |
| `PLAYWRIGHT_AUTO_SUBMIT` | optional | Default `false` — **keep false** unless you intend to submit live applications |
| `ENCRYPTION_KEY` | optional | `openssl rand -hex 32` — needed for credential vault |
| `SCRAPE_DELAY_MS` | optional | Delay between sources in `scrape:run-all` (default `750`) |

### What `PLAYWRIGHT_AUTO_SUBMIT` means

- **`false` (recommended):** Playwright opens the apply URL, fills name/email/phone/cover letter/resume file when possible, saves screenshot/HTML under `storage/artifacts/`, and returns **`MANUAL_REQUIRED`**. You review and submit yourself.
- **`true`:** Also clicks Submit/Apply. Marks **`APPLIED`** only if a confirmation message is detected; otherwise stays `MANUAL_REQUIRED`. This can send real applications — use carefully.

---

## 3. Start MySQL

```bash
docker compose up -d
```

Wait until the container is healthy (`docker compose ps`).

---

## 4. Migrate and seed

```bash
npm run db:migrate
npm run db:seed
```

Default login (unless you changed seed env vars):

- Email: `admin@jobhunter.local`
- Password: `ChangeMe123!`

Change the password after first login in production-like setups.

---

## 5. Run the app

```bash
npm run dev
```

Open:

- English: [http://localhost:3000/en/login](http://localhost:3000/en/login)
- Portuguese: [http://localhost:3000/pt-BR/login](http://localhost:3000/pt-BR/login)

---

## 6. First-time operator flow

1. **Resumes** — seed already creates JS/TS, .NET, and PHP profiles; edit or add yours.
2. **Sources** — click **Sync companies** to import `docs/companies-to-work/`.
3. Use the **search box** to filter by source/company name (e.g. `NVIDIA`, `We Work`, `Apinfo`).
4. Enable sources you care about, then click **Run** on supported ATS types (table above).
5. Open **Jobs** — score, favorite, reject, or approve.
6. Open **Applications** — track status, edit cover letters, or click **Auto-apply** (robot icon).
7. Optional: **Settings → Credential vault** — paste Playwright `storageState` JSON (requires `ENCRYPTION_KEY`) for logged-in sessions.
8. Optional CLI for all enabled scrapable sources:

```bash
npm run scrape:run-all
```

### Auto-apply tips

- Works best on Greenhouse / Lever-style forms.
- Resume: uses uploaded `filePath` when present; otherwise materializes a `.txt` from resume text for file inputs.
- Artifacts land in `storage/artifacts/apply/<applicationId>/…` (gitignored).
- Expect `MANUAL_REQUIRED` until you deliberately enable `PLAYWRIGHT_AUTO_SUBMIT=true`.

---

## Useful scripts

| Script | Purpose |
| ------ | ------- |
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` / `npm start` | Production build & serve |
| `npm run typecheck` | TypeScript |
| `npm test` | Unit tests |
| `npm run db:migrate` | Apply migrations |
| `npm run db:seed` | Seed admin + default resumes |
| `npm run db:studio` | Browse DB |
| `npm run scrape:run-all` | Scrape all enabled supported sources |
| `npx playwright install chromium` | Install browser for auto-apply |

Backups: see [`BACKUP.md`](./BACKUP.md).


---

## Sharing this project with others

1. Push the repo (never commit `.env`).
2. Point them to **this file** from the root README.
3. Keep `.env.example` accurate.
4. Tell them: `npm install` **before** Docker migrate/seed; Docker must be running before `db:migrate`.
5. Mention Playwright Chromium install if they will use Auto-apply.
6. Optionally share a short loom / screenshots of Sources → Jobs → Applications.

---

## Troubleshooting

| Symptom | Fix |
| ------- | --- |
| `'prisma' is not recognized` / `'prisma' não é reconhecido` | Run `npm install` in the project root **before** `db:migrate`. Confirm `node_modules/.bin/prisma` exists. Do not use `npm install --omit=dev`. |
| `Can't reach database server at 127.0.0.1:3306` | Start Docker Desktop, then `docker compose up -d` |
| Run button disabled on a source | ATS not supported yet, or source disabled |
| Accented titles look broken (Apinfo) | Re-run Apinfo scrape; delete old bad rows if needed |
| Auto-apply always says Manual required | Expected unless `PLAYWRIGHT_AUTO_SUBMIT=true` and confirmation is detected |
| Playwright browser missing | Run `npx playwright install chromium` |
| Workday Run fails | URL must be `*.wdN.myworkdayjobs.com/.../SiteName` (tenant + site in path) |
| SmartRecruiters empty | Company identifier in URL must match API slug (e.g. `Canva`) |
| BambooHR Run fails | URL must be `https://{subdomain}.bamboohr.com/careers` (not the marketing site) |
| TeamTailor empty | Careers host must serve `/jobs.json` (e.g. `https://bambuser.teamtailor.com/jobs.json`) |
| Vault save fails / encryption missing | Set `ENCRYPTION_KEY` to `openssl rand -hex 32` in `.env` |

---

## Next reading

- Product vision: [`PROJECT.md`](./PROJECT.md)
- Roadmap / phases: [`ROADMAP.md`](./ROADMAP.md)
- Backlog: [`TODO.md`](./TODO.md)
- Backup / restore: [`BACKUP.md`](./BACKUP.md)
- Scrapers: [`SCRAPERS.md`](./SCRAPERS.md)
- ATS coverage: [`ATS.md`](./ATS.md)
- Playwright rules: [`PLAYWRIGHT.md`](./PLAYWRIGHT.md)

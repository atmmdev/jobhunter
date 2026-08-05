# Security Checklist

Living checklist for Job Hunter AI secrets, authz, and safe automation.

---

## Secrets

| Secret | Where | Rules |
| ------ | ----- | ----- |
| `AUTH_SECRET` | `.env` | Required; `openssl rand -base64 32`; never commit |
| `DATABASE_URL` | `.env` | Local Docker defaults ok; rotate in production |
| `ENCRYPTION_KEY` | `.env` | 64-char hex for vault; losing it loses decrypt |
| `OPENAI_API_KEY` | `.env` | Optional; never log |
| `SEED_USER_PASSWORD` | `.env` | Change after first login in shared environments |
| Playwright storage-state | Credential vault | Encrypted at rest; never return plaintext to UI after save |

- [x] `.env` is gitignored; `.env.example` has placeholders only
- [x] Vault UI does not re-display secrets after save
- [ ] Production secret manager (optional later)

---

## AuthZ (server actions)

All mutating actions must:

1. Call `auth()` / `requireUserId()`
2. Scope reads/writes by `userId` (resumes, applications, vault, notifications)
3. Validate input with Zod

Current surface:

| Action module | Auth required |
| ------------- | ------------- |
| `resume.actions` | yes |
| `job.actions` | yes |
| `application.actions` | yes |
| `scrape.actions` | yes |
| `company.actions` | yes |
| `scoring.actions` | yes |
| `cover-letter.actions` | yes |
| `notification.actions` | yes |
| `credential.actions` | yes |

- [x] Background scrape queue (BullMQ + Redis optional)
- [x] Security headers on Next responses
- [x] Shared `requireUserId` helper

---

## Playwright / auto-apply

- Default: **fill only** (`PLAYWRIGHT_AUTO_SUBMIT=false`) → `MANUAL_REQUIRED`
- Submit only when explicitly enabled
- Artifacts under `storage/artifacts/` (gitignored)
- Captcha / login walls → `MANUAL_REQUIRED` / fail closed

---

## Headers / cookies

- Auth.js session cookies via Next.js
- Do not expose `ENCRYPTION_KEY` or vault plaintext in client bundles

---

## Review cadence

Re-run this checklist when adding:

- New server actions
- New scrape adapters that need credentials
- Production deploy config

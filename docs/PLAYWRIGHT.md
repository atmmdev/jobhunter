# PLAYWRIGHT.md

# Job Hunter AI — Playwright Automation

## Purpose

Use Playwright for:

1. **Auto-fill / submit job applications** on supported sites
2. **Authenticated scraping** when HTTP-only access is insufficient
3. **End-to-end tests** of critical product flows

All runtime automation goes through reusable **browser services** and **site strategies**.

---

## Architecture

```text
Application: ExecuteAutoApply
    → BrowserService (Infrastructure)
        → ApplyStrategyRegistry
            → LinkedInApplyStrategy
            → IndeedApplyStrategy
            → GreenhouseApplyStrategy
            → LeverApplyStrategy
            → WorkdayApplyStrategy
            → GupyApplyStrategy
            → CareersPageApplyStrategy
            → ...
```

### BrowserService responsibilities

- Launch/connect browser
- Create isolated browser context per run
- Optional storage-state load for authenticated providers
- Timeout, tracing, screenshot on failure
- Cleanup contexts even on errors

### ApplyStrategy responsibilities

- Detect if URL/job is supported
- Navigate to apply flow
- Fill fields from `Resume` + `CoverLetter` + profile
- Submit or pause for manual checkpoint
- Return typed result DTO

---

## Hard Rules

1. **Never hardcode selectors inside use cases or UI.**
2. Prefer resilient locators:
   - `getByRole`, `getByLabel`, `getByText`
   - stable `data-testid` when we control the page (our app e2e)
   - ATS-specific stable attributes when documented
3. Centralize selectors in strategy modules or selector maps.
4. One strategy per site family when possible.
5. Never report `APPLIED` unless confirmation signals are observed.
6. If captcha, MFA, or unknown DOM → `MANUAL_REQUIRED`.
7. No shared mutable context across concurrent applies.
8. Secrets/storage states are gitignored and encrypted at rest when stored.

---

## Result Contract

```ts
type AutoApplyResult =
  | { status: 'APPLIED'; externalReference?: string }
  | { status: 'MANUAL_REQUIRED'; reason: string }
  | { status: 'FAILED'; code: string; message: string };
```

Persist artifacts on non-success:

- screenshot path
- HTML snapshot path (redact when possible)
- step timeline

---

## Supported Targets (Roadmap Priority)

| Priority | Target | Notes |
| -------- | ------ | ----- |
| P0 | Greenhouse | Often structured apply forms |
| P0 | Lever | Structured |
| P0 | Company careers (generic heuristics) | Fallback |
| P1 | Ashby | |
| P1 | Workday | Highly variable; expect MANUAL_REQUIRED often |
| P1 | Gupy | Strong BR relevance |
| P2 | LinkedIn | Auth + anti-bot sensitivity |
| P2 | Indeed | Auth + variability |
| P2 | SmartRecruiters / TeamTailor / BambooHR | |
| P3 | Kenoby / Solides / Catho / APInfo | BR ecosystem |

Coverage expands without changing Application interfaces.

---

## Field Mapping

Strategies map canonical candidate fields:

| Canonical field | Sources |
| --------------- | ------- |
| Full name | User profile |
| Email | User profile |
| Phone | User profile |
| Location | User profile |
| LinkedIn URL | User profile |
| Resume file | Selected Resume |
| Cover letter | Generated/edited CoverLetter |
| Work authorization / extras | Profile answers registry |

Unknown required questions → `MANUAL_REQUIRED` (do not invent answers).

---

## Auth & Sessions

- Provider sessions stored via `CredentialVault` + encrypted storage state files
- Refresh/re-auth flows are explicit use cases
- Workers must fail closed if session expired

---

## Resilience

| Concern | Approach |
| ------- | -------- |
| Transient network | Retry with backoff |
| Slow pages | Explicit waits on roles/labels, not fixed long sleeps only |
| A/B DOM | Multiple locator candidates ordered by stability |
| Rate limits | Per-provider concurrency caps |
| Parallelism | Queue; limit concurrent browsers |

---

## Observability

Each apply run logs:

- applicationId, jobId, strategy name
- started/finished
- result status
- failure code
- artifact paths
- correlation id

---

## E2E Testing (Product)

Use Playwright Test for:

- Auth login
- Jobs table filters
- Approve → enqueue apply (mocked browser strategy in CI)
- Dashboard smoke

Separate **automation strategy tests** use local HTML fixtures whenever possible so CI does not depend on live LinkedIn/Indeed.

---

## Local Dev Tips

- Headed mode for developing new strategies
- Trace viewer on failures
- Fixture pages under `tests/fixtures/apply/...`
- Never commit real `storageState.json`

---

## Legal / Ethical Constraints

- Automate only accounts/data the user owns
- Respect site terms and rate limits
- Prefer official ATS APIs when available over brittle UI automation
- Human approval remains the default gate before apply

# ATS.md

# Job Hunter AI — ATS Integrations

## Purpose

Provide first-class adapters for Applicant Tracking Systems and adjacent job platforms so discovery (and later auto-apply) is reliable and normalized.

---

## Supported / Planned ATS & Platforms

### Global ATS

| ATS | Enum | Discovery | Auto-apply priority |
| --- | ---- | --------- | ------------------- |
| Greenhouse | `GREENHOUSE` | Board JSON / API | P0 |
| Lever | `LEVER` | Postings API / board | P0 |
| Ashby | `ASHBY` | Job board API | P1 |
| Workday | `WORKDAY` | Career site / feeds (variable) | P1 |
| BambooHR | `BAMBOOHR` | Careers list/detail JSON | P2 ✅ |
| SmartRecruiters | `SMARTRECRUITERS` | Public postings API | P2 ✅ |
| TeamTailor | `TEAMTAILOR` | Public `/jobs.json` feed | P2 ✅ |

### Brazil-focused ATS / HR

| Platform | Enum | Notes |
| -------- | ---- | ----- |
| Gupy | `GUPY` | Very common in BR tech |
| Kenoby | `KENOBY` | BR ATS |
| Solides | `SOLIDES` | BR HR/ATS |

### Job Boards / Networks

| Platform | Enum | Notes |
| -------- | ---- | ----- |
| LinkedIn | `LINKEDIN` | Auth-heavy; rate limits |
| Indeed | `INDEED` | Regional variants |
| Catho | `CATHO` | BR board |
| APInfo | `APINFO` | BR board |

### Fallback

| Type | Enum | Notes |
| ---- | ---- | ----- |
| Custom careers page | `CUSTOM` | Generic HTML adapter |
| Undetected | `UNKNOWN` | Needs classification |

---

## URL Detection Heuristics

Implement `detectAtsType(url: string): AtsType` in infrastructure.

| Pattern (examples) | ATS |
| ------------------ | --- |
| `boards.greenhouse.io` / `greenhouse.io` | GREENHOUSE |
| `jobs.lever.co` / `lever.co` | LEVER |
| `jobs.ashbyhq.com` / `ashbyhq.com` | ASHBY |
| `myworkdayjobs.com` / `workday.com` | WORKDAY |
| `bamboohr.com` | BAMBOOHR |
| `smartrecruiters.com` | SMARTRECRUITERS |
| `teamtailor.com` | TEAMTAILOR |
| `gupy.io` | GUPY |
| `kenoby.com` | KENOBY |
| `solides.com.br` / `solides.*` | SOLIDES |
| `linkedin.com/jobs` | LINKEDIN |
| `indeed.com` / `indeed.com.br` | INDEED |
| `catho.com.br` | CATHO |
| `apinfo.com` | APINFO |

Heuristics must be unit-tested. Ambiguous URLs → `UNKNOWN` or `CUSTOM`.

---

## Adapter Interface

```ts
interface AtsAdapter {
  readonly atsType: AtsType;
  /**
   * Fetches normalized raw jobs for a configured source/board.
   */
  listJobs(input: AtsListJobsInput): Promise<RawJobDto[]>;
  /**
   * Optional: fetch a single job by external id.
   */
  getJob?(input: AtsGetJobInput): Promise<RawJobDto | null>;
}
```

Register adapters in `AtsAdapterRegistry`.

Scrapers and ATS adapters share the same normalization path (`SCRAPERS.md`).

---

## External IDs

Always capture vendor job ids when available:

| ATS | Typical external id |
| --- | ------------------- |
| Greenhouse | numeric/string job id |
| Lever | posting id |
| Ashby | job id |
| Workday | requisition / path id |
| SmartRecruiters | posting id |
| BambooHR | job opening id |
| TeamTailor | feed item id / job UUID |
| Gupy | job id from URL/API |

`@@unique([sourceId, externalId])` prevents duplicates.

---

## Board Configuration

`Source.config` JSON examples (illustrative):

```json
{
  "boardToken": "acme",
  "departmentWhitelist": ["Engineering"],
  "locationWhitelist": ["Remote", "Brazil"]
}
```

```json
{
  "workdayTenant": "acme",
  "siteId": "acme_careers"
}
```

Validate config with Zod per ATS.

---

## Discovery vs Apply

| Concern | Owner |
| ------- | ----- |
| List/normalize jobs | ATS / Scraper adapters |
| Submit applications | Playwright strategies (`PLAYWRIGHT.md`) |

Do not mix apply form automation into list adapters.

When an ATS offers an official apply API, prefer it behind the same `ExecuteAutoApply` port — Playwright remains a strategy implementation detail.

---

## Extending with a New ATS

1. Add enum value in Prisma + `DATABASE.md`
2. Add URL heuristics + unit tests
3. Implement `AtsAdapter` with fixtures
4. Register in registry
5. Optionally add Playwright `ApplyStrategy`
6. Update this file + `TODO.md`

---

## Health Monitoring

Per ATS track:

- last success time
- error rate
- jobs/day
- parse failure rate
- auth failures

Surface in dashboard **ATS Statistics**.

---

## Compliance Notes

- Use public board endpoints where permitted
- Store only necessary candidate credentials
- Prefer user-provided board URLs from `docs/companies-to-work/` and manual Source entries
- Document known ToS constraints per adapter as they are implemented

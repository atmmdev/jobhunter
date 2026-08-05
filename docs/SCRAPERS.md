# SCRAPERS.md

# Job Hunter AI — Scrapers & Crawlers

## Purpose

Discover job opportunities from heterogeneous sources and normalize them into the domain `Job` model.

Scraping is an **Infrastructure** concern. Application use cases orchestrate; adapters extract.

---

## Pipeline

```text
Scheduler / Manual Trigger
  → Load enabled Sources
  → SourceRunner
      → Adapter (ATS API | HTML | Telegram | Slack)
      → Zod validate RawJobDto[]
      → NormalizeJobService → NormalizedJobDto
      → Dedupe (externalId + contentHash)
      → Upsert Job (+ Company link)
      → Persist ScrapeRun metrics + artifacts
      → Enqueue scoring
```

---

## Source Types

| Type | Examples | Strategy |
| ---- | -------- | -------- |
| `ATS` | Greenhouse, Lever, Ashby, Workday, SmartRecruiters, BambooHR, Gupy… | Prefer public board JSON/API; HTML fallback |
| `CAREERS` | Company career pages from `docs/companies-to-work/` | HTML parse + ATS detection redirect |
| `JOB_BOARD` | LinkedIn, Indeed, Catho, APInfo | Authenticated or public listing adapters |
| `TELEGRAM` | Job groups | Bot/MTProto or export ingestion |
| `SLACK` | Job channels | Slack API with user token |
| `OTHER` | GitHub vagas repos | Issues/API adapters |

---

## Seed Data: `docs/companies-to-work/`

This folder is the **initial discovery catalog**, not the live database.

Files include regional lists:

- `worldwide.md`, `brazil.md`, `usa.md`, `canada.md`
- `uk.md`, `england.md`, `germany.md`, `netherlands.md`
- `ireland.md`, `estonia.md`, `switzerland.md`
- `japan.md`, `australia.md`

Each table row ≈ `{ name, link }`.

### Sync use case

`SyncCompaniesFromMarkdown`

1. Parse markdown tables
2. Infer country from filename
3. Detect ATS from URL (`ATS.md` heuristics)
4. Upsert `Company` + default `Source` (careers/ATS)
5. Report created/updated/skipped

---

## Normalization Contract

All adapters must produce `NormalizedJobDto` (Zod):

| Field | Required | Notes |
| ----- | -------- | ----- |
| sourceKey | yes | stable source identifier |
| externalId | preferred | ATS id when available |
| title | yes | |
| descriptionText | yes | plain text |
| descriptionHtml | no | |
| applyUrl | yes | |
| location | no | |
| country | no | |
| isRemote | no | |
| salaryRaw | no | |
| postedAt | no | |
| companyName | no | |
| companyUrl | no | |
| technologiesHint | no | pre-AI hints |
| raw | no | reference to artifact |

Invalid rows are skipped and counted in `ScrapeRun` errors — they must not crash the whole run unless the adapter itself fails hard.

---

## Deduplication

Order of checks:

1. `(sourceId, externalId)` exact match → update
2. Else `contentHash` of normalized canonical fields → update/link
3. Else AI near-duplicate assist (optional, async)
4. Else insert new Job

Canonical hash input example:

`normalize(title) + companyId/name + applyUrl host/path + location`

---

## Adapter Design

```text
interface JobSourceAdapter {
  readonly key: string;
  supports(source: Source): boolean;
  fetchJobs(source: Source, ctx: ScrapeContext): Promise<RawJobDto[]>;
}
```

Rules:

- One adapter class per family when practical
- No Playwright inside adapters unless HTTP fails and strategy declares browser mode
- Keep HTML parsing libraries behind infrastructure utilities
- Always timeout and limit page size

---

## Rate Limiting & Politeness

- Per-source concurrency (default 1–2)
- Respect `Retry-After`
- Exponential backoff on 429/5xx
- Cache board listings briefly when safe
- Configurable user-agent for HTTP scrapers

---

## Artifacts & Audit

For debugging and replay:

- Store raw JSON/HTML in object storage or local `storage/artifacts/`
- Link via `ScrapeArtifact`
- Retention policy (e.g. 30 days) configurable

---

## Telegram & Slack

Treat as first-class sources with dedicated adapters:

| Channel | Ingest |
| ------- | ------ |
| Telegram | Monitor configured groups/channels; parse messages for links + titles |
| Slack | Listen or poll channels; extract job links |

Normalize message → job candidate → same upsert pipeline.

---

## Error Taxonomy

| Code | Meaning |
| ---- | ------- |
| `SOURCE_DISABLED` | Skipped |
| `AUTH_EXPIRED` | Needs re-auth |
| `HTTP_ERROR` | Upstream failure |
| `PARSE_ERROR` | DOM/JSON unexpected |
| `VALIDATION_ERROR` | Zod reject |
| `RATE_LIMITED` | Backoff scheduled |
| `PARTIAL_SUCCESS` | Some jobs saved |

---

## Testing

- Fixture HTML/JSON per adapter under `tests/fixtures/scrapers/`
- Contract tests: fixture → `NormalizedJobDto[]`
- Integration: upsert + dedupe against test DB
- Do not hit live sites in default CI

---

## Anti-Patterns

- Giant scraper with all sites in one file
- Persisting only screenshots without structured fields
- Using AI as the primary HTML parser for every page (too slow/expensive)
- Silent empty success when selectors broke

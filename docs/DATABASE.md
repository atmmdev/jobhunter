# DATABASE.md

# Job Hunter AI — Database Design

## Principles

- Prisma ORM + MySQL
- UUID primary keys (`String @id @default(uuid())`)
- Normalized schema
- Migrations for every change
- Indexes for hot query paths
- No raw SQL unless justified and documented
- Repositories are the only persistence gateway

---

## Core Entities (Logical Model)

### User

Application owner / operator.

| Field | Type | Notes |
| ----- | ---- | ----- |
| id | UUID | PK |
| email | String | Unique |
| name | String? | |
| locale | `pt-BR` \| `en` | UI preference |
| createdAt / updatedAt | DateTime | |

### Resume

Multiple resumes per user.

| Field | Type | Notes |
| ----- | ---- | ----- |
| id | UUID | PK |
| userId | UUID | FK |
| name | String | e.g. "React/Next/Node" |
| stack | Enum/String | `JS_TS`, `DOTNET`, `PHP`, `OTHER` |
| summary | Text? | |
| contentText | LongText | Parsed plain text |
| filePath | String? | Stored file ref |
| technologies | M2M | Via ResumeTechnology |
| isActive | Boolean | |
| createdAt / updatedAt | DateTime | |

### Company

| Field | Type | Notes |
| ----- | ---- | ----- |
| id | UUID | PK |
| name | String | |
| website | String? | |
| careersUrl | String? | |
| country | String? | ISO or label |
| atsType | Enum? | See `ATS.md` |
| isRemoteFriendly | Boolean? | |
| sourceMeta | JSON? | Import origin from `docs/companies-to-work` |
| createdAt / updatedAt | DateTime | |

**Indexes:** `name`, `atsType`, `country`

### Source

Crawl/ingest definition.

| Field | Type | Notes |
| ----- | ---- | ----- |
| id | UUID | PK |
| name | String | |
| type | Enum | `ATS`, `CAREERS`, `JOB_BOARD`, `TELEGRAM`, `SLACK`, `OTHER` |
| atsType | Enum? | |
| baseUrl | String | |
| companyId | UUID? | FK optional |
| enabled | Boolean | |
| scheduleCron | String? | |
| lastRunAt | DateTime? | |
| lastStatus | Enum? | `SUCCESS`, `PARTIAL`, `FAILED` |
| config | JSON? | selectors, board tokens, channel ids |
| createdAt / updatedAt | DateTime | |

**Indexes:** `enabled`, `type`, `atsType`

### Job

Normalized opportunity.

| Field | Type | Notes |
| ----- | ---- | ----- |
| id | UUID | PK |
| companyId | UUID? | FK |
| sourceId | UUID | FK |
| externalId | String? | ATS job id |
| title | String | |
| descriptionHtml | LongText? | |
| descriptionText | LongText | |
| location | String? | |
| country | String? | |
| isRemote | Boolean? | |
| employmentType | String? | full-time, contract… |
| seniority | String? | |
| salaryMin | Decimal? | |
| salaryMax | Decimal? | |
| salaryCurrency | String? | |
| salaryRaw | String? | |
| applyUrl | String | |
| postedAt | DateTime? | |
| scrapedAt | DateTime | |
| contentHash | String | Dedupe |
| status | Enum | `NEW`, `SCORED`, `FAVORITED`, `REJECTED`, `APPROVED`, `APPLIED`, `INTERVIEW`, `OFFER`, `CLOSED` |
| rawArtifactId | UUID? | Optional scrape snapshot |
| createdAt / updatedAt | DateTime | |

**Unique / Indexes:**

- Unique preferred: `@@unique([sourceId, externalId])` when externalId present
- Index: `contentHash`, `status`, `postedAt`, `scrapedAt`, `companyId`, `isRemote`, `country`

### JobTechnology

| Field | Type | Notes |
| ----- | ---- | ----- |
| jobId | UUID | PK/FK |
| technologyId | UUID | PK/FK |
| confidence | Float? | AI extraction confidence |

### Technology

| Field | Type | Notes |
| ----- | ---- | ----- |
| id | UUID | PK |
| name | String | Unique normalized |
| category | String? | language, framework, tool |

### JobScore

| Field | Type | Notes |
| ----- | ---- | ----- |
| id | UUID | PK |
| jobId | UUID | FK unique per scoring version strategy |
| userId | UUID | FK |
| score | Int | 0–100 |
| breakdown | JSON | skills, salary, remote, seniority… |
| explanation | Text? | |
| model | String? | |
| promptVersion | String? | |
| createdAt | DateTime | |

**Indexes:** `score`, `jobId`, `userId`

### JobResumeMatch

| Field | Type | Notes |
| ----- | ---- | ----- |
| id | UUID | PK |
| jobId | UUID | FK |
| resumeId | UUID | FK |
| matchScore | Int | 0–100 |
| reasons | JSON | |
| isRecommended | Boolean | |
| createdAt | DateTime | |

**Unique:** `@@unique([jobId, resumeId])`

### Application

| Field | Type | Notes |
| ----- | ---- | ----- |
| id | UUID | PK |
| jobId | UUID | FK |
| userId | UUID | FK |
| resumeId | UUID | FK |
| coverLetterId | UUID? | FK |
| status | Enum | `DRAFT`, `PENDING_APPROVAL`, `APPROVED`, `PENDING_APPLY`, `APPLIED`, `FAILED`, `MANUAL_REQUIRED`, `INTERVIEW`, `REJECTED`, `OFFER`, `WITHDRAWN` |
| approvedAt | DateTime? | |
| appliedAt | DateTime? | |
| failureCode | String? | |
| failureMessage | Text? | |
| provider | String? | linkedin, greenhouse… |
| externalReference | String? | confirmation id |
| createdAt / updatedAt | DateTime | |

**Indexes:** `status`, `appliedAt`, `userId`, `jobId`

### CoverLetter

| Field | Type | Notes |
| ----- | ---- | ----- |
| id | UUID | PK |
| userId | UUID | FK |
| jobId | UUID | FK |
| resumeId | UUID | FK |
| content | LongText | |
| locale | String | |
| model | String? | |
| promptVersion | String? | |
| createdAt | DateTime | |

### ScrapeRun

| Field | Type | Notes |
| ----- | ---- | ----- |
| id | UUID | PK |
| sourceId | UUID | FK |
| startedAt | DateTime | |
| finishedAt | DateTime? | |
| status | Enum | |
| jobsFound | Int | |
| jobsUpserted | Int | |
| errorSummary | Text? | |

### ScrapeArtifact

| Field | Type | Notes |
| ----- | ---- | ----- |
| id | UUID | PK |
| scrapeRunId | UUID? | FK |
| jobId | UUID? | FK |
| contentType | String | html/json |
| storagePath | String | |
| createdAt | DateTime | |

### Notification

| Field | Type | Notes |
| ----- | ---- | ----- |
| id | UUID | PK |
| userId | UUID | FK |
| type | String | |
| title | String | |
| body | Text | |
| payload | JSON? | |
| readAt | DateTime? | |
| createdAt | DateTime | |

### CredentialVault (sensitive)

| Field | Type | Notes |
| ----- | ---- | ----- |
| id | UUID | PK |
| userId | UUID | FK |
| provider | String | linkedin, indeed… |
| ciphertext | Text | Encrypted blob |
| iv | String | |
| createdAt / updatedAt | DateTime | |

Never store plaintext passwords.

### AuditLog

| Field | Type | Notes |
| ----- | ---- | ----- |
| id | UUID | PK |
| actorType | `USER` \| `SYSTEM` | |
| actorId | String? | |
| action | String | |
| entityType | String | |
| entityId | String? | |
| metadata | JSON? | |
| createdAt | DateTime | |

---

## Enums (Initial)

```text
AtsType:
  GREENHOUSE, LEVER, ASHBY, WORKDAY, BAMBOOHR,
  SMARTRECRUITERS, TEAMTAILOR, GUPY, KENOBY, SOLIDES,
  LINKEDIN, INDEED, CATHO, APINFO, CUSTOM, UNKNOWN

JobStatus:
  NEW, SCORED, FAVORITED, REJECTED, APPROVED,
  APPLIED, INTERVIEW, OFFER, CLOSED

ApplicationStatus:
  DRAFT, PENDING_APPROVAL, APPROVED, PENDING_APPLY,
  APPLIED, FAILED, MANUAL_REQUIRED, INTERVIEW,
  REJECTED, OFFER, WITHDRAWN

ResumeStack:
  JS_TS, DOTNET, PHP, OTHER
```

---

## Dashboard Query Notes

| Metric | Approach |
| ------ | -------- |
| Jobs Found | `COUNT(Job)` filtered by date |
| Applications | `COUNT(Application)` |
| Favorites / Rejected | `Job.status` counts |
| Interviews / Offers | Application or Job status |
| Response Rate | interviews+offers / applied |
| Top Technologies | aggregate JobTechnology |
| Salary Analytics | avg/median of salaryMin/Max by country/stack |
| Countries | group by Job.country |
| ATS Statistics | join Source/Company.atsType |

Prefer application read-model services; add SQL views later only if needed.

---

## Seeding from `docs/companies-to-work/`

Import markdown tables into `Company` (+ optional `Source`):

1. Parse Name + Link
2. Detect `atsType` from URL heuristics
3. Set `country` from filename (`brazil.md` → BR, etc.)
4. Upsert by normalized website/careersUrl

---

## Migration Rules

1. Never edit applied migrations; create new ones
2. Expand → migrate → contract for breaking changes
3. Document non-trivial migrations here
4. CI must run `prisma validate` / migrate diff checks

---

## Prisma Location

```text
prisma/schema.prisma
prisma/migrations/
```

Repositories:

```text
src/modules/infrastructure/repositories/
```

# PROJECT.md

# Job Hunter AI — Project Definition

## Vision

Build a production-ready platform that discovers, evaluates, and applies to software engineering jobs across the globe — with human-in-the-loop control and AI-assisted decision making.

## Problem

Job hunting across Greenhouse, Lever, Ashby, Workday, LinkedIn, Indeed, Brazilian boards (Gupy, Catho, APInfo), Telegram, Slack, and hundreds of company career pages is fragmented, repetitive, and slow.

Candidates waste hours:

- Checking the same ATS repeatedly
- Copying resumes and cover letters
- Losing track of applications
- Applying to poorly matched roles

## Solution

**Job Hunter AI** centralizes discovery → scoring → matching → application → tracking into one enterprise-grade system.

## Goals

| Goal | Description |
| ---- | ----------- |
| Discover | Continuously ingest jobs from ATS platforms, career pages, job boards, and community channels |
| Parse | Normalize job descriptions into structured domain entities |
| Score | Rank jobs with AI against profile, stack, salary, location, and preference rules |
| Match | Recommend the best resume variant per job |
| Generate | Produce tailored cover letters |
| Approve | Require manual approval before automated applications |
| Apply | Auto-fill applications with Playwright where supported |
| Track | Persist full application lifecycle and outcomes |
| Analyze | Dashboard metrics: response rate, salaries, tech demand, ATS stats, countries |
| Notify | Alert on new high-score jobs, interviews, failures, and digests |

## Non-Goals (v1)

- Fully unsupervised mass applying without approval
- Guaranteeing every ATS can be auto-applied (coverage grows iteratively)
- Replacing a human recruiter relationship
- Building a public multi-tenant SaaS marketplace in the first release

## Primary Users

1. **Job Seeker (owner)** — configures profiles, resumes, preferences, approvals
2. **System (agents/workers)** — scrapes, scores, applies, notifies
3. **Future Admin** — monitors scrapers, quotas, health

## Resume Strategy

The system supports multiple resumes and must recommend the best one automatically:

| Profile | Stack focus |
| ------- | ----------- |
| Frontend / Full-stack JS | React, Next.js, Node, TypeScript |
| Backend .NET | C#, ASP.NET Core |
| Backend PHP | PHP, Laravel, WordPress |

Matching considers job technologies, seniority, keywords, and historical success.

## Source Strategy

Seed company and board URLs from `docs/companies-to-work/`:

- `worldwide.md`, `brazil.md`, `usa.md`, `canada.md`, `uk.md`, `england.md`
- `germany.md`, `netherlands.md`, `ireland.md`, `estonia.md`
- `switzerland.md`, `japan.md`, `australia.md`
- Salary baselines in `docs/companies-to-work/README.md`

Additional sources:

- Greenhouse, Lever, Ashby, Workday, BambooHR, SmartRecruiters, TeamTailor
- Gupy, Kenoby, Solides
- LinkedIn, Indeed, Catho, APInfo
- Telegram groups, Slack channels
- Generic company careers pages

## Success Metrics

| Metric | Target direction |
| ------ | ---------------- |
| Jobs discovered / day | Increase coverage without duplicate spam |
| High-score jobs surfaced | Precision over volume |
| Time from discovery → approved application | Decrease |
| Response rate | Increase via better matching |
| Failed auto-apply rate | Decrease via resilient selectors + retries |
| Manual effort hours / week | Decrease |

## Languages

UI must support:

- Portuguese (pt-BR)
- English (en)

## Product Principles

1. **Human approval by default** for applications
2. **Structured data first** — never store only raw HTML as truth
3. **Resilient automation** — prefer stable locators and graceful degradation
4. **Observable system** — every scrape, score, and apply must be auditable
5. **Privacy** — credentials, cookies, and resume files are secrets

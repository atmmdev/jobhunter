# AI.md

# Job Hunter AI — AI Subsystem

## Purpose

Provide structured intelligence for parsing, scoring, matching, writing, and deduplication — always validated, auditable, and provider-agnostic.

---

## Provider Abstraction

Infrastructure interface (Domain/Application depend on the port):

```ts
interface AiClient {
  /**
   * Runs a chat completion and parses the result with a Zod schema.
   */
  chatStructured<T>(input: StructuredChatInput<T>): Promise<T>;
}
```

Configuration via env:

- `OPENAI_API_KEY`
- `OPENAI_BASE_URL` (optional, compatible gateways)
- `OPENAI_MODEL`

Never call vendor SDKs from Application/UI.

---

## Capabilities

| Capability | Input | Output (Zod) | Consumer |
| ---------- | ----- | ------------ | -------- |
| Job parsing | title + description | structured fields | Scrape normalize / enrich |
| Technology extraction | description | tech[] + confidence | JobTechnology |
| Salary extraction | description | min/max/currency/raw | Job |
| Seniority / employment type | description | enums/strings | Job |
| Job scoring | job + preferences + resumes | score 0–100 + breakdown | JobScore |
| Resume matching | job + resumes | ranked matches + reasons | JobResumeMatch |
| Cover letter generation | job + resume + locale | letter text | CoverLetter |
| Duplicate detection assist | job A vs B / embedding later | similarity + rationale | Dedupe service |

---

## Structured Output Rule

Every AI feature must:

1. Define a Zod schema in `src/shared/schemas/ai/...`
2. Ask the model for JSON matching that schema
3. `safeParse` / parse before persistence
4. On parse failure: retry once with repair prompt OR fail with typed error
5. Persist `model` + `promptVersion` with the result when stored

**Never** trust free-form model text as authoritative structured data.

---

## Prompt Versioning

Store prompts as versioned modules:

```text
src/modules/infrastructure/ai/prompts/
  parse-job.v1.ts
  score-job.v1.ts
  match-resume.v1.ts
  cover-letter.v1.ts
  extract-salary.v1.ts
  extract-technologies.v1.ts
  duplicate-check.v1.ts
```

When changing behavior meaningfully, bump `vN` and record in outputs.

---

## Scoring Model (Hybrid)

AI score is an input to a domain policy — not the sole truth.

Suggested breakdown weights (tunable):

| Factor | Weight (example) |
| ------ | ---------------- |
| Technology overlap | 35% |
| Seniority fit | 15% |
| Remote / location fit | 15% |
| Salary fit vs preference + market baselines | 15% |
| Title/role relevance | 10% |
| Recency / source quality | 5% |
| AI qualitative fit | 5% |

Domain policy clamps to 0–100 and attaches explanation.

Market salary baselines can use `docs/companies-to-work/README.md` as initial reference data (imported to config tables later).

---

## Resume Recommendation

Given active resumes:

1. Extract job technologies / keywords
2. Score each resume (`JS_TS`, `DOTNET`, `PHP`, …)
3. Mark `isRecommended = true` on the top match
4. Persist reasons: overlapping skills, missing skills, language of JD, historical apply success (when available)

UI must show **why** a resume was recommended.

---

## Cover Letters

Rules:

- Locale-aware (`pt-BR` / `en`)
- Grounded in resume + job description (no fabricated employers)
- Concise professional tone
- Versioned per generation
- Editable by user before approval/apply

---

## Privacy & Safety

Do **not** send to the model:

- Passwords, cookies, storage states
- Full credential vault payloads
- Irrelevant personal documents

Minimize PII; prefer skills/experience excerpts over full legal identity docs.

---

## Failure Handling

| Failure | Behavior |
| ------- | -------- |
| Rate limit | Retry with backoff; requeue |
| Invalid JSON | One repair attempt; then fail |
| Timeout | Fail scrape-enrich step without blocking raw job upsert |
| Low confidence extraction | Store nulls + raw text; allow manual edit |

Job discovery must not hard-fail solely because enrichment AI failed — store job as `NEW` and retry scoring.

---

## Observability

Log:

- promptVersion
- model
- latency
- token usage (if available)
- success/parse_error/provider_error
- correlation id (`scrapeRunId`, `jobId`)

Do not log full resumes or cover letters at info level by default.

---

## Testing

- Unit-test Zod schemas with fixture model outputs
- Contract-test prompt modules with recorded fixtures (no live API in CI by default)
- Optional integration job behind `AI_LIVE_TEST=1`

---

## Future Extensions

- Embeddings for semantic search and near-duplicate detection
- Per-user preference fine-tuning
- Evaluation harness for scoring precision (offline dataset)

import { CreateJobService } from '@/modules/application/job/create-job.service';
import { ListJobsService } from '@/modules/application/job/list-jobs.service';
import { UpdateJobStatusService } from '@/modules/application/job/update-job-status.service';
import { SyncCompaniesFromMarkdownService } from '@/modules/application/company/sync-companies-from-markdown.service';
import { GetDashboardStatsService } from '@/modules/application/analytics/get-dashboard-stats.service';
import { CreateResumeService } from '@/modules/application/resume/create-resume.service';
import { DeleteResumeService } from '@/modules/application/resume/delete-resume.service';
import { ListResumesService } from '@/modules/application/resume/list-resumes.service';
import { UpdateResumeService } from '@/modules/application/resume/update-resume.service';
import { ListScrapeRunsService } from '@/modules/application/scrape/list-scrape-runs.service';
import { RunSourceScrapeService } from '@/modules/application/scrape/run-source-scrape.service';
import { ScoreJobService } from '@/modules/application/scoring/score-job.service';
import { ListSourcesService } from '@/modules/application/source/list-sources.service';
import { SetSourceEnabledService } from '@/modules/application/source/set-source-enabled.service';
import { OpenAiCompatibleClient } from '@/modules/infrastructure/ai/openai-compatible.client';
import { JobSourceAdapterRegistry } from '@/modules/infrastructure/scrapers/adapter-registry';
import { PrismaAnalyticsRepository } from '@/modules/infrastructure/repositories/prisma-analytics.repository';
import { PrismaCompanyRepository } from '@/modules/infrastructure/repositories/prisma-company.repository';
import { PrismaCompanySeedRepository } from '@/modules/infrastructure/repositories/prisma-company-seed.repository';
import { PrismaJobRepository } from '@/modules/infrastructure/repositories/prisma-job.repository';
import { PrismaResumeRepository } from '@/modules/infrastructure/repositories/prisma-resume.repository';
import { PrismaScrapePersistenceRepository } from '@/modules/infrastructure/repositories/prisma-scrape-persistence.repository';
import { PrismaScrapeRunRepository } from '@/modules/infrastructure/repositories/prisma-scrape-run.repository';
import { PrismaSourceRepository } from '@/modules/infrastructure/repositories/prisma-source.repository';

function createAiClient() {
  return new OpenAiCompatibleClient(
    process.env.OPENAI_API_KEY,
    process.env.OPENAI_MODEL || 'gpt-4o-mini',
    process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  );
}

/**
 * Composes application services with Prisma repositories (composition root).
 */
export function createJobModule() {
  const jobs = new PrismaJobRepository();
  const sources = new PrismaSourceRepository();
  const companies = new PrismaCompanyRepository();

  return {
    createJob: new CreateJobService(jobs, sources, companies),
    listJobs: new ListJobsService(jobs),
    updateJobStatus: new UpdateJobStatusService(jobs),
  };
}

/**
 * Composes resume application services.
 */
export function createResumeModule() {
  const resumes = new PrismaResumeRepository();

  return {
    createResume: new CreateResumeService(resumes),
    updateResume: new UpdateResumeService(resumes),
    listResumes: new ListResumesService(resumes),
    deleteResume: new DeleteResumeService(resumes),
  };
}

/**
 * Composes company seed and source listing services.
 */
export function createCompanyModule() {
  const seeds = new PrismaCompanySeedRepository();
  const runs = new PrismaScrapeRunRepository();

  return {
    syncCompanies: new SyncCompaniesFromMarkdownService(seeds),
    listSources: new ListSourcesService(seeds),
    setSourceEnabled: new SetSourceEnabledService(seeds),
    listScrapeRuns: new ListScrapeRunsService(runs),
  };
}

/**
 * Composes scrape/discovery services.
 */
export function createScrapeModule() {
  const jobs = new PrismaJobRepository();
  const persistence = new PrismaScrapePersistenceRepository();
  const adapters = new JobSourceAdapterRegistry();

  return {
    runSource: new RunSourceScrapeService(persistence, jobs, adapters),
  };
}

/**
 * Composes scoring services.
 */
export function createScoringModule() {
  const jobs = new PrismaJobRepository();
  const resumes = new PrismaResumeRepository();
  const ai = createAiClient();

  return {
    scoreJob: new ScoreJobService(
      jobs,
      resumes,
      ai,
      process.env.OPENAI_MODEL || 'gpt-4o-mini',
    ),
  };
}

/**
 * Composes analytics services.
 */
export function createAnalyticsModule() {
  return {
    getDashboardStats: new GetDashboardStatsService(new PrismaAnalyticsRepository()),
  };
}

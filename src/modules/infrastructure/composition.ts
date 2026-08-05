import { DeleteVaultSecretService } from '@/modules/application/credential/delete-vault-secret.service';
import { ListVaultEntriesService } from '@/modules/application/credential/list-vault-entries.service';
import { UpsertVaultSecretService } from '@/modules/application/credential/upsert-vault-secret.service';
import { CreateHighScoreNotificationService } from '@/modules/application/notification/create-high-score-notification.service';
import { ListNotificationsService } from '@/modules/application/notification/list-notifications.service';
import { MarkNotificationReadService } from '@/modules/application/notification/mark-notification-read.service';
import { GenerateCoverLetterService } from '@/modules/application/cover-letter/generate-cover-letter.service';
import { UpdateCoverLetterService } from '@/modules/application/cover-letter/update-cover-letter.service';
import { CreateApplicationFromJobService } from '@/modules/application/application/create-application-from-job.service';
import { ListApplicationsService } from '@/modules/application/application/list-applications.service';
import { TransitionApplicationService } from '@/modules/application/application/transition-application.service';
import { ExecuteAutoApplyService } from '@/modules/application/apply/execute-auto-apply.service';
import { CreateJobService } from '@/modules/application/job/create-job.service';
import { DeleteJobsService } from '@/modules/application/job/delete-jobs.service';
import { ListJobsService } from '@/modules/application/job/list-jobs.service';
import { UpdateJobStatusService } from '@/modules/application/job/update-job-status.service';
import { EnrichJobService } from '@/modules/application/enrichment/enrich-job.service';
import { SyncCompaniesFromMarkdownService } from '@/modules/application/company/sync-companies-from-markdown.service';
import { GetDashboardStatsService } from '@/modules/application/analytics/get-dashboard-stats.service';
import { CreateResumeService } from '@/modules/application/resume/create-resume.service';
import { DeleteResumeService } from '@/modules/application/resume/delete-resume.service';
import { ListResumesService } from '@/modules/application/resume/list-resumes.service';
import { UpdateResumeService } from '@/modules/application/resume/update-resume.service';
import { RunEnabledSourcesService } from '@/modules/application/scrape/run-enabled-sources.service';
import { ListScrapeRunsService } from '@/modules/application/scrape/list-scrape-runs.service';
import { RunSourceScrapeService } from '@/modules/application/scrape/run-source-scrape.service';
import { ScoreJobService } from '@/modules/application/scoring/score-job.service';
import { ListSourcesService } from '@/modules/application/source/list-sources.service';
import { SetSourceEnabledService } from '@/modules/application/source/set-source-enabled.service';
import { OpenAiCompatibleClient } from '@/modules/infrastructure/ai/openai-compatible.client';
import { ApplyArtifactStore } from '@/modules/infrastructure/apply/apply-artifact-store';
import { ApplyStrategyRegistry } from '@/modules/infrastructure/apply/apply-strategy-registry';
import { PlaywrightBrowserService } from '@/modules/infrastructure/apply/playwright-browser.service';
import { JobSourceAdapterRegistry } from '@/modules/infrastructure/scrapers/adapter-registry';
import { PrismaAnalyticsRepository } from '@/modules/infrastructure/repositories/prisma-analytics.repository';
import { PrismaApplicationRepository } from '@/modules/infrastructure/repositories/prisma-application.repository';
import { PrismaAuditLogRepository } from '@/modules/infrastructure/repositories/prisma-audit-log.repository';
import { PrismaCoverLetterRepository } from '@/modules/infrastructure/repositories/prisma-cover-letter.repository';
import { PrismaCredentialVaultRepository } from '@/modules/infrastructure/repositories/prisma-credential-vault.repository';
import { PrismaCompanyRepository } from '@/modules/infrastructure/repositories/prisma-company.repository';
import { PrismaCompanySeedRepository } from '@/modules/infrastructure/repositories/prisma-company-seed.repository';
import { PrismaJobRepository } from '@/modules/infrastructure/repositories/prisma-job.repository';
import { PrismaNotificationRepository } from '@/modules/infrastructure/repositories/prisma-notification.repository';
import { PrismaResumeRepository } from '@/modules/infrastructure/repositories/prisma-resume.repository';
import { PrismaScrapePersistenceRepository } from '@/modules/infrastructure/repositories/prisma-scrape-persistence.repository';
import { PrismaScrapeRunRepository } from '@/modules/infrastructure/repositories/prisma-scrape-run.repository';
import { PrismaSourceRepository } from '@/modules/infrastructure/repositories/prisma-source.repository';
import { PrismaUserRepository } from '@/modules/infrastructure/repositories/prisma-user.repository';
import { CredentialCrypto } from '@/modules/infrastructure/security/credential-crypto';

function getHighScoreThreshold(): number {
  const raw = Number(process.env.HIGH_SCORE_THRESHOLD ?? 75);
  if (Number.isNaN(raw)) {
    return 75;
  }
  return Math.min(100, Math.max(0, Math.round(raw)));
}

function createHighScoreNotificationService() {
  return new CreateHighScoreNotificationService(
    new PrismaNotificationRepository(),
    getHighScoreThreshold(),
  );
}

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
    deleteJobs: new DeleteJobsService(jobs),
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
  const runSource = new RunSourceScrapeService(persistence, jobs, adapters);

  return {
    runSource,
    runEnabledSources: new RunEnabledSourcesService(persistence, runSource, adapters),
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
      createHighScoreNotificationService(),
      new EnrichJobService(jobs),
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

/**
 * Composes application workflow services.
 */
export function createApplicationModule() {
  const applications = new PrismaApplicationRepository();
  const jobs = new PrismaJobRepository();
  const resumes = new PrismaResumeRepository();
  const coverLetters = new PrismaCoverLetterRepository();
  const users = new PrismaUserRepository();
  const audit = new PrismaAuditLogRepository();
  const crypto = new CredentialCrypto();
  const vault = new PrismaCredentialVaultRepository(crypto);

  return {
    createFromJob: new CreateApplicationFromJobService(applications, jobs, resumes, audit),
    listApplications: new ListApplicationsService(applications),
    transition: new TransitionApplicationService(applications, jobs, audit),
    executeAutoApply: new ExecuteAutoApplyService(
      applications,
      jobs,
      resumes,
      coverLetters,
      users,
      vault,
      new PlaywrightBrowserService(),
      new ApplyStrategyRegistry(),
      new ApplyArtifactStore(),
      audit,
    ),
  };
}

/**
 * Composes encrypted credential vault services.
 */
export function createCredentialModule() {
  const crypto = new CredentialCrypto();
  const vault = new PrismaCredentialVaultRepository(crypto);
  return {
    crypto,
    listVaultEntries: new ListVaultEntriesService(vault),
    upsertVaultSecret: new UpsertVaultSecretService(vault, crypto),
    deleteVaultSecret: new DeleteVaultSecretService(vault),
  };
}

/**
 * Composes cover letter generation and editing services.
 */
export function createCoverLetterModule() {
  const applications = new PrismaApplicationRepository();
  const jobs = new PrismaJobRepository();
  const resumes = new PrismaResumeRepository();
  const coverLetters = new PrismaCoverLetterRepository();
  const ai = createAiClient();

  return {
    generateCoverLetter: new GenerateCoverLetterService(
      applications,
      jobs,
      resumes,
      coverLetters,
      ai,
      process.env.OPENAI_MODEL || 'gpt-4o-mini',
    ),
    updateCoverLetter: new UpdateCoverLetterService(coverLetters, applications),
  };
}

/**
 * Composes in-app notification services.
 */
export function createNotificationModule() {
  const notifications = new PrismaNotificationRepository();

  return {
    listNotifications: new ListNotificationsService(notifications),
    markRead: new MarkNotificationReadService(notifications),
  };
}

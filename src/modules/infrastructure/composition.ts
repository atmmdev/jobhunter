import { CreateJobService } from '@/modules/application/job/create-job.service';
import { ListJobsService } from '@/modules/application/job/list-jobs.service';
import { UpdateJobStatusService } from '@/modules/application/job/update-job-status.service';
import { SyncCompaniesFromMarkdownService } from '@/modules/application/company/sync-companies-from-markdown.service';
import { CreateResumeService } from '@/modules/application/resume/create-resume.service';
import { DeleteResumeService } from '@/modules/application/resume/delete-resume.service';
import { ListResumesService } from '@/modules/application/resume/list-resumes.service';
import { ListSourcesService } from '@/modules/application/source/list-sources.service';
import { PrismaCompanyRepository } from '@/modules/infrastructure/repositories/prisma-company.repository';
import { PrismaCompanySeedRepository } from '@/modules/infrastructure/repositories/prisma-company-seed.repository';
import { PrismaJobRepository } from '@/modules/infrastructure/repositories/prisma-job.repository';
import { PrismaResumeRepository } from '@/modules/infrastructure/repositories/prisma-resume.repository';
import { PrismaSourceRepository } from '@/modules/infrastructure/repositories/prisma-source.repository';

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
    listResumes: new ListResumesService(resumes),
    deleteResume: new DeleteResumeService(resumes),
  };
}

/**
 * Composes company seed and source listing services.
 */
export function createCompanyModule() {
  const seeds = new PrismaCompanySeedRepository();

  return {
    syncCompanies: new SyncCompaniesFromMarkdownService(seeds),
    listSources: new ListSourcesService(seeds),
  };
}

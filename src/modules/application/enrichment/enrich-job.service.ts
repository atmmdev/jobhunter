import { extractSalary } from '@/modules/domain/enrichment/extract-salary.policy';
import { extractTechnologies } from '@/modules/domain/enrichment/extract-technologies.policy';
import type { JobRepository } from '@/modules/domain/job/job.repository';
import { NotFoundError } from '@/modules/domain/shared/errors';
import { prisma } from '@/modules/infrastructure/prisma/client';

export interface EnrichJobResult {
  jobId: string;
  technologies: string[];
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
}

/**
 * Enriches a job with deterministic technology and salary extraction.
 */
export class EnrichJobService {
  constructor(private readonly jobs: JobRepository) {}

  async execute(jobId: string): Promise<EnrichJobResult> {
    const job = await this.jobs.findById(jobId);
    if (!job) {
      throw new NotFoundError('Job', jobId);
    }

    const technologies = extractTechnologies({
      title: job.title,
      descriptionText: job.descriptionText,
    });
    const salary = extractSalary({
      title: job.title,
      descriptionText: job.descriptionText,
      salaryRaw: job.salaryRaw,
    });

    await prisma.job.update({
      where: { id: job.id },
      data: {
        salaryMin: salary.min,
        salaryMax: salary.max,
        salaryCurrency: salary.currency,
        ...(salary.raw && !job.salaryRaw ? { salaryRaw: salary.raw } : {}),
      },
    });

    for (const tech of technologies) {
      const technology = await prisma.technology.upsert({
        where: { name: tech.name },
        create: { name: tech.name, category: tech.category },
        update: { category: tech.category },
      });

      await prisma.jobTechnology.upsert({
        where: {
          jobId_technologyId: {
            jobId: job.id,
            technologyId: technology.id,
          },
        },
        create: {
          jobId: job.id,
          technologyId: technology.id,
          confidence: tech.confidence,
        },
        update: {
          confidence: tech.confidence,
        },
      });
    }

    return {
      jobId: job.id,
      technologies: technologies.map((tech) => tech.name),
      salaryMin: salary.min,
      salaryMax: salary.max,
      salaryCurrency: salary.currency,
    };
  }
}

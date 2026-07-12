import type { AiClient } from '@/modules/domain/ai/ai-client';
import type { ApplicationRepository } from '@/modules/domain/application/application.repository';
import type { CoverLetterRepository } from '@/modules/domain/cover-letter/cover-letter.repository';
import { buildDeterministicCoverLetter } from '@/modules/domain/cover-letter/deterministic-cover-letter.policy';
import type { CoverLetterEntity } from '@/modules/domain/cover-letter/cover-letter.entity';
import type { JobRepository } from '@/modules/domain/job/job.repository';
import type { ResumeRepository } from '@/modules/domain/resume/resume.repository';
import { NotFoundError } from '@/modules/domain/shared/errors';
import type { AppLocale } from '@/modules/domain/user/user.entity';
import { aiCoverLetterSchema } from '@/shared/schemas/cover-letter.schema';
import type { GenerateCoverLetterDto } from '@/shared/schemas/cover-letter.schema';

export interface GenerateCoverLetterResult {
  coverLetter: CoverLetterEntity;
  usedAi: boolean;
}

/**
 * Generates a cover letter for an application using AI or a deterministic template.
 */
export class GenerateCoverLetterService {
  constructor(
    private readonly applications: ApplicationRepository,
    private readonly jobs: JobRepository,
    private readonly resumes: ResumeRepository,
    private readonly coverLetters: CoverLetterRepository,
    private readonly ai: AiClient,
    private readonly modelName: string,
  ) {}

  async execute(
    userId: string,
    candidateName: string,
    input: GenerateCoverLetterDto,
  ): Promise<GenerateCoverLetterResult> {
    const application = await this.applications.findById(input.applicationId);
    if (!application || application.userId !== userId) {
      throw new NotFoundError('Application', input.applicationId);
    }

    const [job, resume] = await Promise.all([
      this.jobs.findById(application.jobId),
      this.resumes.findById(application.resumeId),
    ]);

    if (!job) {
      throw new NotFoundError('Job', application.jobId);
    }
    if (!resume || resume.userId !== userId) {
      throw new NotFoundError('Resume', application.resumeId);
    }

    const locale: AppLocale = input.locale ?? resume.locale;
    let content = buildDeterministicCoverLetter({
      locale,
      candidateName,
      jobTitle: job.title,
      companyName: job.companyName,
      resumeSummary: resume.summary,
      resumeExcerpt: resume.contentText,
    });
    let usedAi = false;
    let model: string | null = 'deterministic-v1';
    let promptVersion: string | null = 'cover-letter.v1';

    if (this.ai.isConfigured()) {
      try {
        const aiResult = await this.ai.chatStructured({
          promptVersion: 'cover-letter.v1',
          schema: aiCoverLetterSchema,
          system:
            'Write a concise professional cover letter grounded in the resume and job description. Do not invent employers or credentials. Match the requested locale tone.',
          user: JSON.stringify({
            locale,
            candidateName,
            jobTitle: job.title,
            companyName: job.companyName,
            location: job.location,
            isRemote: job.isRemote,
            descriptionExcerpt: job.descriptionText.slice(0, 4000),
            resumeSummary: resume.summary,
            resumeExcerpt: resume.contentText.slice(0, 3000),
          }),
        });
        content = aiResult.content;
        usedAi = true;
        model = this.modelName;
      } catch {
        // Keep deterministic template if AI fails.
      }
    }

    const coverLetter = await this.coverLetters.create({
      userId,
      jobId: job.id,
      resumeId: resume.id,
      content,
      locale,
      model,
      promptVersion,
    });

    await this.applications.attachCoverLetter(application.id, coverLetter.id);

    return { coverLetter, usedAi };
  }
}

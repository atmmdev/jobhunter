import type { AiClient } from '@/modules/domain/ai/ai-client';
import type { JobRepository } from '@/modules/domain/job/job.repository';
import type { CreateHighScoreNotificationService } from '@/modules/application/notification/create-high-score-notification.service';
import type { ResumeRepository } from '@/modules/domain/resume/resume.repository';
import { NotFoundError } from '@/modules/domain/shared/errors';
import { scoreJobAgainstStacks } from '@/modules/domain/scoring/score-job.policy';
import {
  aiScoreSchema,
} from '@/modules/infrastructure/ai/openai-compatible.client';
import { prisma } from '@/modules/infrastructure/prisma/client';

export interface ScoreJobResult {
  jobId: string;
  score: number;
  explanation: string;
  recommendedResumeId: string | null;
  usedAi: boolean;
}

/**
 * Scores a job for a user using deterministic policy (+ optional AI refinement).
 */
export class ScoreJobService {
  constructor(
    private readonly jobs: JobRepository,
    private readonly resumes: ResumeRepository,
    private readonly ai: AiClient,
    private readonly modelName: string,
    private readonly highScoreNotifications?: CreateHighScoreNotificationService,
  ) {}

  async execute(userId: string, jobId: string): Promise<ScoreJobResult> {
    const job = await this.jobs.findById(jobId);
    if (!job) {
      throw new NotFoundError('Job', jobId);
    }

    const resumes = (await this.resumes.listByUser(userId)).filter((resume) => resume.isActive);
    const availableStacks = [...new Set(resumes.map((resume) => resume.stack))];

    const deterministic = scoreJobAgainstStacks({
      title: job.title,
      descriptionText: job.descriptionText,
      isRemote: job.isRemote,
      availableStacks,
    });

    let score = deterministic.score;
    let explanation = deterministic.explanation;
    let usedAi = false;

    if (this.ai.isConfigured()) {
      try {
        const aiResult = await this.ai.chatStructured({
          promptVersion: 'score-job.v1',
          schema: aiScoreSchema,
          system:
            'You score software job fit from 0-100 for a candidate with given resume stacks. Be concise.',
          user: JSON.stringify({
            title: job.title,
            location: job.location,
            isRemote: job.isRemote,
            descriptionExcerpt: job.descriptionText.slice(0, 4000),
            availableStacks,
            deterministicScore: deterministic.score,
          }),
        });
        score = Math.round(aiResult.score * 0.6 + deterministic.score * 0.4);
        explanation = `${aiResult.explanation} | Deterministic: ${deterministic.explanation}`;
        usedAi = true;
      } catch {
        // Keep deterministic score if AI fails.
      }
    }

    const recommendedResume =
      resumes.find((resume) => resume.stack === deterministic.recommendedStack) ??
      resumes[0] ??
      null;

    await prisma.jobScore.create({
      data: {
        jobId: job.id,
        userId,
        score,
        breakdown: {
          technologyOverlap: deterministic.breakdown.technologyOverlap,
          remoteBonus: deterministic.breakdown.remoteBonus,
          keywordHits: deterministic.breakdown.keywordHits,
          recommendedStack: deterministic.breakdown.recommendedStack,
        },
        explanation,
        model: usedAi ? this.modelName : 'deterministic-v1',
        promptVersion: usedAi ? 'score-job.v1' : 'deterministic-v1',
      },
    });

    for (const resume of resumes) {
      const matchScore =
        resume.stack === deterministic.recommendedStack
          ? score
          : Math.max(0, score - 25);

      await prisma.jobResumeMatch.upsert({
        where: {
          jobId_resumeId: {
            jobId: job.id,
            resumeId: resume.id,
          },
        },
        create: {
          jobId: job.id,
          resumeId: resume.id,
          matchScore,
          reasons: {
            stack: resume.stack,
            recommended: resume.id === recommendedResume?.id,
            keywordHits: deterministic.breakdown.keywordHits,
          },
          isRecommended: resume.id === recommendedResume?.id,
        },
        update: {
          matchScore,
          reasons: {
            stack: resume.stack,
            recommended: resume.id === recommendedResume?.id,
            keywordHits: deterministic.breakdown.keywordHits,
          },
          isRecommended: resume.id === recommendedResume?.id,
        },
      });
    }

    if (job.status === 'NEW') {
      await prisma.job.update({
        where: { id: job.id },
        data: { status: 'SCORED' },
      });
    }

    if (this.highScoreNotifications) {
      await this.highScoreNotifications.execute({
        userId,
        jobId: job.id,
        jobTitle: job.title,
        companyName: job.companyName,
        score,
      });
    }

    return {
      jobId: job.id,
      score,
      explanation,
      recommendedResumeId: recommendedResume?.id ?? null,
      usedAi,
    };
  }
}

import type { EnrichJobService } from '@/modules/application/enrichment/enrich-job.service';
import type { CreateHighScoreNotificationService } from '@/modules/application/notification/create-high-score-notification.service';
import type { PreferenceLearningService } from '@/modules/application/scoring/preference-learning.service';
import type { AiClient } from '@/modules/domain/ai/ai-client';
import type { JobRepository } from '@/modules/domain/job/job.repository';
import type { ResumeRepository } from '@/modules/domain/resume/resume.repository';
import { scoreJobAgainstStacks } from '@/modules/domain/scoring/score-job.policy';
import { NotFoundError } from '@/modules/domain/shared/errors';
import { aiScoreSchema } from '@/modules/infrastructure/ai/openai-compatible.client';
import { prisma } from '@/modules/infrastructure/prisma/client';

export interface ScoreJobResult {
  jobId: string;
  score: number;
  explanation: string;
  recommendedResumeId: string | null;
  usedAi: boolean;
  technologies: string[];
}

/**
 * Scores a job for a user using deterministic policy (+ optional AI + preference learning).
 */
export class ScoreJobService {
  constructor(
    private readonly jobs: JobRepository,
    private readonly resumes: ResumeRepository,
    private readonly ai: AiClient,
    private readonly modelName: string,
    private readonly highScoreNotifications?: CreateHighScoreNotificationService,
    private readonly enrichJob?: EnrichJobService,
    private readonly preferences?: PreferenceLearningService,
  ) {}

  async execute(userId: string, jobId: string): Promise<ScoreJobResult> {
    const job = await this.jobs.findById(jobId);
    if (!job) {
      throw new NotFoundError('Job', jobId);
    }

    const enrichment = this.enrichJob
      ? await this.enrichJob.execute(job.id)
      : { technologies: [] as string[] };

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
            technologies: enrichment.technologies,
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

    if (this.preferences) {
      const signals = await this.preferences.getSignals(userId);
      const adjusted = this.preferences.adjustScore(
        score,
        `${job.title}\n${job.descriptionText}`,
        signals,
      );
      if (adjusted.delta !== 0) {
        score = adjusted.score;
        explanation = `${explanation} | Preferences: delta ${adjusted.delta} (${adjusted.hits.join(', ') || 'none'})`;
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
          technologies: enrichment.technologies,
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
      technologies: enrichment.technologies,
    };
  }
}

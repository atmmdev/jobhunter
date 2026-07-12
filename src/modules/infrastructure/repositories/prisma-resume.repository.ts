import type { Resume as PrismaResume } from '@prisma/client';

import type { ResumeEntity, ResumeStackValue } from '@/modules/domain/resume/resume.entity';
import type {
  CreateResumePersistInput,
  ResumeRepository,
  UpdateResumePersistInput,
} from '@/modules/domain/resume/resume.repository';
import { prisma } from '@/modules/infrastructure/prisma/client';

function mapResume(resume: PrismaResume): ResumeEntity {
  return {
    id: resume.id,
    userId: resume.userId,
    name: resume.name,
    stack: resume.stack as ResumeStackValue,
    summary: resume.summary,
    contentText: resume.contentText,
    filePath: resume.filePath,
    isActive: resume.isActive,
    createdAt: resume.createdAt,
    updatedAt: resume.updatedAt,
  };
}

/**
 * Prisma implementation of the Resume repository port.
 */
export class PrismaResumeRepository implements ResumeRepository {
  async findById(id: string): Promise<ResumeEntity | null> {
    const resume = await prisma.resume.findUnique({ where: { id } });
    return resume ? mapResume(resume) : null;
  }

  async listByUser(userId: string): Promise<ResumeEntity[]> {
    const resumes = await prisma.resume.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
    return resumes.map(mapResume);
  }

  async create(input: CreateResumePersistInput): Promise<ResumeEntity> {
    const resume = await prisma.resume.create({
      data: {
        userId: input.userId,
        name: input.name,
        stack: input.stack,
        summary: input.summary ?? null,
        contentText: input.contentText,
        isActive: input.isActive ?? true,
      },
    });
    return mapResume(resume);
  }

  async update(id: string, input: UpdateResumePersistInput): Promise<ResumeEntity> {
    const resume = await prisma.resume.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.stack !== undefined ? { stack: input.stack } : {}),
        ...(input.summary !== undefined ? { summary: input.summary } : {}),
        ...(input.contentText !== undefined ? { contentText: input.contentText } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      },
    });
    return mapResume(resume);
  }

  async delete(id: string): Promise<void> {
    await prisma.resume.delete({ where: { id } });
  }
}

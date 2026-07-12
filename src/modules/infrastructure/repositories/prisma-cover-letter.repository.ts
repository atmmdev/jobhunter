import type { CoverLetter as PrismaCoverLetter } from '@prisma/client';

import type { CoverLetterEntity } from '@/modules/domain/cover-letter/cover-letter.entity';
import type {
  CoverLetterRepository,
  CreateCoverLetterInput,
} from '@/modules/domain/cover-letter/cover-letter.repository';
import { prisma } from '@/modules/infrastructure/prisma/client';

function mapCoverLetter(row: PrismaCoverLetter): CoverLetterEntity {
  return {
    id: row.id,
    userId: row.userId,
    jobId: row.jobId,
    resumeId: row.resumeId,
    content: row.content,
    locale: row.locale === 'pt_BR' ? 'pt-BR' : 'en',
    model: row.model,
    promptVersion: row.promptVersion,
    createdAt: row.createdAt,
  };
}

/**
 * Prisma implementation of the CoverLetter repository port.
 */
export class PrismaCoverLetterRepository implements CoverLetterRepository {
  async findById(id: string): Promise<CoverLetterEntity | null> {
    const row = await prisma.coverLetter.findUnique({ where: { id } });
    return row ? mapCoverLetter(row) : null;
  }

  async create(input: CreateCoverLetterInput): Promise<CoverLetterEntity> {
    const row = await prisma.coverLetter.create({
      data: {
        userId: input.userId,
        jobId: input.jobId,
        resumeId: input.resumeId,
        content: input.content,
        locale: input.locale === 'pt-BR' ? 'pt_BR' : 'en',
        model: input.model ?? null,
        promptVersion: input.promptVersion ?? null,
      },
    });
    return mapCoverLetter(row);
  }

  async updateContent(id: string, content: string): Promise<CoverLetterEntity> {
    const row = await prisma.coverLetter.update({
      where: { id },
      data: { content },
    });
    return mapCoverLetter(row);
  }
}

import { z } from 'zod';

export const appLocaleSchema = z.enum(['en', 'pt-BR']);

export const generateCoverLetterSchema = z.object({
  applicationId: z.string().uuid(),
  locale: appLocaleSchema.optional(),
});

export type GenerateCoverLetterDto = z.infer<typeof generateCoverLetterSchema>;

export const updateCoverLetterSchema = z.object({
  coverLetterId: z.string().uuid(),
  content: z.string().trim().min(50).max(20_000),
});

export type UpdateCoverLetterDto = z.infer<typeof updateCoverLetterSchema>;

export const aiCoverLetterSchema = z.object({
  content: z.string().min(50).max(20_000),
});

export type AiCoverLetterDto = z.infer<typeof aiCoverLetterSchema>;

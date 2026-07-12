import { z } from 'zod';

export const resumeStackSchema = z.enum(['JS_TS', 'DOTNET', 'PHP', 'OTHER']);
export const resumeLocaleSchema = z.enum(['en', 'pt-BR']);

/**
 * Payload for creating a resume variant.
 */
export const createResumeSchema = z.object({
  name: z.string().trim().min(2).max(120),
  stack: resumeStackSchema,
  locale: resumeLocaleSchema,
  summary: z.string().trim().max(2000).optional().or(z.literal('')),
  contentText: z.string().trim().min(20),
  isActive: z.boolean(),
});

export type CreateResumeDto = z.infer<typeof createResumeSchema>;

/**
 * Payload for updating an existing resume.
 */
export const updateResumeSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(2).max(120),
  stack: resumeStackSchema,
  locale: resumeLocaleSchema,
  summary: z.string().trim().max(2000).optional().or(z.literal('')),
  contentText: z.string().trim().min(20),
  isActive: z.boolean(),
});

export type UpdateResumeDto = z.infer<typeof updateResumeSchema>;

export const deleteResumeSchema = z.object({
  id: z.string().uuid(),
});

export type DeleteResumeDto = z.infer<typeof deleteResumeSchema>;

import { z } from 'zod';

export const resumeStackSchema = z.enum(['JS_TS', 'DOTNET', 'PHP', 'OTHER']);

/**
 * Payload for creating a resume variant.
 */
export const createResumeSchema = z.object({
  name: z.string().trim().min(2).max(120),
  stack: resumeStackSchema,
  summary: z.string().trim().max(2000).optional().or(z.literal('')),
  contentText: z.string().trim().min(20),
  isActive: z.boolean(),
});

export type CreateResumeDto = z.infer<typeof createResumeSchema>;

export const updateResumeSchema = createResumeSchema.partial().extend({
  id: z.string().uuid(),
});

export type UpdateResumeDto = z.infer<typeof updateResumeSchema>;

export const deleteResumeSchema = z.object({
  id: z.string().uuid(),
});

export type DeleteResumeDto = z.infer<typeof deleteResumeSchema>;

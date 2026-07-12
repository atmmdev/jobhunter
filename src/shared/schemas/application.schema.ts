import { z } from 'zod';

export const applicationStatusSchema = z.enum([
  'DRAFT',
  'PENDING_APPROVAL',
  'APPROVED',
  'PENDING_APPLY',
  'APPLIED',
  'FAILED',
  'MANUAL_REQUIRED',
  'INTERVIEW',
  'REJECTED',
  'OFFER',
  'WITHDRAWN',
]);

export const manualApplicationTransitionSchema = z.enum([
  'APPROVED',
  'PENDING_APPLY',
  'APPLIED',
  'MANUAL_REQUIRED',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
  'WITHDRAWN',
]);

/**
 * Query for listing applications.
 */
export const listApplicationsQuerySchema = z.object({
  status: applicationStatusSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type ListApplicationsQueryDto = z.infer<typeof listApplicationsQuerySchema>;

export const createApplicationFromJobSchema = z.object({
  jobId: z.string().uuid(),
  resumeId: z.string().uuid().optional(),
});

export type CreateApplicationFromJobDto = z.infer<typeof createApplicationFromJobSchema>;

export const transitionApplicationSchema = z.object({
  applicationId: z.string().uuid(),
  status: manualApplicationTransitionSchema,
});

export type TransitionApplicationDto = z.infer<typeof transitionApplicationSchema>;

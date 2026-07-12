import { z } from 'zod';

export const jobStatusSchema = z.enum([
  'NEW',
  'SCORED',
  'FAVORITED',
  'REJECTED',
  'APPROVED',
  'APPLIED',
  'INTERVIEW',
  'OFFER',
  'CLOSED',
]);

export const manualJobStatusSchema = z.enum(['FAVORITED', 'REJECTED', 'NEW']);

/**
 * Payload for manually creating a job.
 */
export const createJobSchema = z.object({
  title: z.string().trim().min(2).max(200),
  descriptionText: z.string().trim().min(10),
  applyUrl: z.string().url(),
  companyName: z.string().trim().min(1).max(200).optional().or(z.literal('')),
  location: z.string().trim().max(200).optional().or(z.literal('')),
  country: z.string().trim().max(100).optional().or(z.literal('')),
  isRemote: z.boolean().optional(),
  employmentType: z.string().trim().max(100).optional().or(z.literal('')),
  seniority: z.string().trim().max(100).optional().or(z.literal('')),
  salaryRaw: z.string().trim().max(200).optional().or(z.literal('')),
});

export type CreateJobDto = z.infer<typeof createJobSchema>;

export const listJobsQuerySchema = z.object({
  status: jobStatusSchema.optional(),
  search: z.string().trim().max(200).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type ListJobsQueryDto = z.infer<typeof listJobsQuerySchema>;

export const updateJobStatusSchema = z.object({
  jobId: z.string().uuid(),
  status: manualJobStatusSchema,
});

export type UpdateJobStatusDto = z.infer<typeof updateJobStatusSchema>;

export const deleteJobSchema = z.object({
  jobId: z.string().uuid(),
});

export type DeleteJobDto = z.infer<typeof deleteJobSchema>;

export const deleteJobsSchema = z.object({
  jobIds: z.array(z.string().uuid()).min(1).max(100),
});

export type DeleteJobsDto = z.infer<typeof deleteJobsSchema>;

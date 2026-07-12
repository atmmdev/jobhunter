import { z } from 'zod';

/**
 * Normalized job payload produced by every scraper/ATS adapter.
 */
export const normalizedJobSchema = z.object({
  sourceKey: z.string().min(1),
  externalId: z.string().min(1).optional(),
  title: z.string().trim().min(1),
  descriptionText: z.string().trim().min(1),
  descriptionHtml: z.string().optional(),
  applyUrl: z.string().url(),
  location: z.string().optional(),
  country: z.string().optional(),
  isRemote: z.boolean().optional(),
  employmentType: z.string().optional(),
  seniority: z.string().optional(),
  salaryRaw: z.string().optional(),
  postedAt: z.coerce.date().optional(),
  companyName: z.string().optional(),
});

export type NormalizedJobDto = z.infer<typeof normalizedJobSchema>;

export const runSourceSchema = z.object({
  sourceId: z.string().uuid(),
});

export type RunSourceDto = z.infer<typeof runSourceSchema>;

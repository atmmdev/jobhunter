import { z } from 'zod';

export const sourceSortBySchema = z.enum([
  'name',
  'company',
  'ats',
  'country',
  'enabled',
  'url',
]);

export const listSourcesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: sourceSortBySchema.default('name'),
  sortDir: z.enum(['asc', 'desc']).default('asc'),
});

export type ListSourcesQueryDto = z.infer<typeof listSourcesQuerySchema>;
export type SourceSortBy = z.infer<typeof sourceSortBySchema>;

import { z } from 'zod';

export const autoApplyResultSchema = z.discriminatedUnion('status', [
  z.object({
    status: z.literal('APPLIED'),
    externalReference: z.string().optional(),
    provider: z.string().min(1),
    artifactPaths: z.array(z.string()).default([]),
  }),
  z.object({
    status: z.literal('MANUAL_REQUIRED'),
    reason: z.string().min(1),
    provider: z.string().min(1),
    artifactPaths: z.array(z.string()).default([]),
  }),
  z.object({
    status: z.literal('FAILED'),
    code: z.string().min(1),
    message: z.string().min(1),
    provider: z.string().min(1),
    artifactPaths: z.array(z.string()).default([]),
  }),
]);

export type AutoApplyResult = z.infer<typeof autoApplyResultSchema>;

export const executeAutoApplySchema = z.object({
  applicationId: z.string().uuid(),
});

export type ExecuteAutoApplyDto = z.infer<typeof executeAutoApplySchema>;

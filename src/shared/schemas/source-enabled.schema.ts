import { z } from 'zod';

export const setSourceEnabledSchema = z.object({
  sourceId: z.string().uuid(),
  enabled: z.boolean(),
});

export type SetSourceEnabledDto = z.infer<typeof setSourceEnabledSchema>;

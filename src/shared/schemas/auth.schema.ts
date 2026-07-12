import { z } from 'zod';

/**
 * Login form payload validated at the presentation boundary.
 */
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type LoginDto = z.infer<typeof loginSchema>;

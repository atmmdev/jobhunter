import { z } from 'zod';

export const VAULT_PROVIDERS = ['linkedin', 'indeed', 'generic'] as const;

export const upsertVaultSecretSchema = z
  .object({
    provider: z.enum(VAULT_PROVIDERS),
    storageStateJson: z.string().min(2).max(2_000_000),
  })
  .superRefine((value, ctx) => {
    try {
      const parsed: unknown = JSON.parse(value.storageStateJson);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['storageStateJson'],
          message: 'storageState must be a JSON object',
        });
        return;
      }
      const cookies = (parsed as { cookies?: unknown }).cookies;
      if (cookies !== undefined && !Array.isArray(cookies)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['storageStateJson'],
          message: 'storageState.cookies must be an array when present',
        });
      }
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['storageStateJson'],
        message: 'storageState must be valid JSON',
      });
    }
  });

export const deleteVaultSecretSchema = z.object({
  provider: z.string().min(1).max(64),
});

export type UpsertVaultSecretDto = z.infer<typeof upsertVaultSecretSchema>;
export type DeleteVaultSecretDto = z.infer<typeof deleteVaultSecretSchema>;

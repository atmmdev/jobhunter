'use server';

import { revalidatePath } from 'next/cache';

import { DomainError } from '@/modules/domain/shared/errors';
import { auth } from '@/modules/infrastructure/auth/auth';
import { createCredentialModule } from '@/modules/infrastructure/composition';
import {
  deleteVaultSecretSchema,
  upsertVaultSecretSchema,
} from '@/shared/schemas/credential-vault.schema';

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new DomainError('UNAUTHORIZED', 'You must be signed in');
  }
  return session.user.id;
}

/**
 * Saves an encrypted Playwright storage-state for a provider.
 */
export async function upsertVaultSecretAction(
  input: unknown,
): Promise<ActionResult<{ provider: string }>> {
  try {
    const userId = await requireUserId();
    const parsed = upsertVaultSecretSchema.parse(input);
    const { upsertVaultSecret } = createCredentialModule();
    const result = await upsertVaultSecret.execute(userId, parsed);
    revalidatePath('/[locale]/settings', 'page');
    return { ok: true, data: result };
  } catch (error) {
    return { ok: false, error: toErrorMessage(error) };
  }
}

/**
 * Deletes a vaulted provider secret.
 */
export async function deleteVaultSecretAction(
  input: unknown,
): Promise<ActionResult<{ provider: string }>> {
  try {
    const userId = await requireUserId();
    const parsed = deleteVaultSecretSchema.parse(input);
    const { deleteVaultSecret } = createCredentialModule();
    const result = await deleteVaultSecret.execute(userId, parsed);
    revalidatePath('/[locale]/settings', 'page');
    return { ok: true, data: result };
  } catch (error) {
    return { ok: false, error: toErrorMessage(error) };
  }
}

function toErrorMessage(error: unknown): string {
  if (error instanceof DomainError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unexpected error';
}

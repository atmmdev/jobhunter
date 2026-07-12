'use server';

import { revalidatePath } from 'next/cache';

import { DomainError } from '@/modules/domain/shared/errors';
import { auth } from '@/modules/infrastructure/auth/auth';
import { createCompanyModule } from '@/modules/infrastructure/composition';

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

/**
 * Syncs companies/sources from docs/companies-to-work.
 */
export async function syncCompaniesAction(): Promise<
  ActionResult<{
    totalParsed: number;
    companiesCreated: number;
    companiesUpdated: number;
    sourcesCreated: number;
  }>
> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new DomainError('UNAUTHORIZED', 'You must be signed in');
    }

    const { syncCompanies } = createCompanyModule();
    const result = await syncCompanies.execute();
    revalidatePath('/[locale]/sources', 'page');
    return { ok: true, data: result };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unexpected error',
    };
  }
}

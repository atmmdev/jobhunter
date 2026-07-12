'use server';

import { revalidatePath } from 'next/cache';

import { DomainError } from '@/modules/domain/shared/errors';
import { auth } from '@/modules/infrastructure/auth/auth';
import { createApplicationModule } from '@/modules/infrastructure/composition';
import {
  createApplicationFromJobSchema,
  transitionApplicationSchema,
} from '@/shared/schemas/application.schema';

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

/**
 * Creates an application from a job (approval queue entry).
 */
export async function createApplicationFromJobAction(
  input: unknown,
): Promise<ActionResult<{ id: string; status: string }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new DomainError('UNAUTHORIZED', 'You must be signed in');
    }

    const parsed = createApplicationFromJobSchema.parse(input);
    const { createFromJob } = createApplicationModule();
    const application = await createFromJob.execute(
      session.user.id,
      parsed.jobId,
      parsed.resumeId,
    );

    revalidatePath('/[locale]/applications', 'page');
    revalidatePath('/[locale]/jobs', 'page');
    revalidatePath('/[locale]/dashboard', 'page');

    return { ok: true, data: { id: application.id, status: application.status } };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unexpected error',
    };
  }
}

/**
 * Transitions an application to the next workflow status.
 */
export async function transitionApplicationAction(
  input: unknown,
): Promise<ActionResult<{ id: string; status: string }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new DomainError('UNAUTHORIZED', 'You must be signed in');
    }

    const parsed = transitionApplicationSchema.parse(input);
    const { transition } = createApplicationModule();
    const application = await transition.execute(session.user.id, parsed);

    revalidatePath('/[locale]/applications', 'page');
    revalidatePath('/[locale]/jobs', 'page');
    revalidatePath('/[locale]/dashboard', 'page');

    return { ok: true, data: { id: application.id, status: application.status } };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unexpected error',
    };
  }
}

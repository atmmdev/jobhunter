'use server';

import { revalidatePath } from 'next/cache';

import { createJobModule } from '@/modules/infrastructure/composition';
import { auth } from '@/modules/infrastructure/auth/auth';
import { DomainError } from '@/modules/domain/shared/errors';
import {
  createJobSchema,
  deleteJobSchema,
  listJobsQuerySchema,
  updateJobStatusSchema,
} from '@/shared/schemas/job.schema';

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
 * Creates a manually entered job.
 */
export async function createJobAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    await requireUserId();
    const parsed = createJobSchema.parse(input);
    const { createJob } = createJobModule();
    const job = await createJob.execute(parsed);
    revalidatePath('/[locale]/jobs', 'page');
    return { ok: true, data: { id: job.id } };
  } catch (error) {
    return { ok: false, error: toErrorMessage(error) };
  }
}

/**
 * Lists jobs for the jobs table.
 */
export async function listJobsAction(input: unknown = {}) {
  await requireUserId();
  const parsed = listJobsQuerySchema.parse(input);
  const { listJobs } = createJobModule();
  return listJobs.execute(parsed);
}

/**
 * Updates job status (favorite / reject / restore).
 */
export async function updateJobStatusAction(
  input: unknown,
): Promise<ActionResult<{ id: string; status: string }>> {
  try {
    await requireUserId();
    const parsed = updateJobStatusSchema.parse(input);
    const { updateJobStatus } = createJobModule();
    const job = await updateJobStatus.execute(parsed);
    revalidatePath('/[locale]/jobs', 'page');
    return { ok: true, data: { id: job.id, status: job.status } };
  } catch (error) {
    return { ok: false, error: toErrorMessage(error) };
  }
}

/**
 * Permanently deletes a job.
 */
export async function deleteJobAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    await requireUserId();
    const parsed = deleteJobSchema.parse(input);
    const { deleteJob } = createJobModule();
    await deleteJob.execute(parsed);
    revalidatePath('/[locale]/jobs', 'page');
    revalidatePath('/[locale]/dashboard', 'page');
    revalidatePath('/[locale]/applications', 'page');
    return { ok: true, data: { id: parsed.jobId } };
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

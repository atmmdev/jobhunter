'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { DomainError } from '@/modules/domain/shared/errors';
import { auth } from '@/modules/infrastructure/auth/auth';
import { createNotificationModule } from '@/modules/infrastructure/composition';

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const markReadSchema = z.object({
  notificationId: z.string().uuid(),
});

/**
 * Marks a notification as read.
 */
export async function markNotificationReadAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new DomainError('UNAUTHORIZED', 'You must be signed in');
    }

    const parsed = markReadSchema.parse(input);
    const { markRead } = createNotificationModule();
    const notification = await markRead.execute(session.user.id, parsed.notificationId);

    revalidatePath('/[locale]', 'layout');

    return { ok: true, data: { id: notification.id } };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unexpected error',
    };
  }
}

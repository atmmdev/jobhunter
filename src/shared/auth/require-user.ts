import { auth } from '@/modules/infrastructure/auth/auth';
import { DomainError } from '@/modules/domain/shared/errors';

/**
 * Requires an authenticated session and returns the user id.
 */
export async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new DomainError('UNAUTHORIZED', 'You must be signed in');
  }
  return session.user.id;
}

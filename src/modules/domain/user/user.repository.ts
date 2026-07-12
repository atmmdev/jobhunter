import type { AppLocale, UserEntity } from '@/modules/domain/user/user.entity';

/**
 * Persistence port for User aggregate.
 */
export interface UserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findCredentialsByEmail(
    email: string,
  ): Promise<(UserEntity & { passwordHash: string | null }) | null>;
  updateLocale(userId: string, locale: AppLocale): Promise<UserEntity>;
}

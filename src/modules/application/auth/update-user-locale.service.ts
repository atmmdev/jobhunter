import type { AppLocale, UserEntity } from '@/modules/domain/user/user.entity';
import type { UserRepository } from '@/modules/domain/user/user.repository';
import { NotFoundError } from '@/modules/domain/shared/errors';

/**
 * Updates the preferred UI locale for a user.
 */
export class UpdateUserLocaleService {
  constructor(private readonly users: UserRepository) {}

  async execute(userId: string, locale: AppLocale): Promise<UserEntity> {
    const existing = await this.users.findById(userId);
    if (!existing) {
      throw new NotFoundError('User', userId);
    }

    return this.users.updateLocale(userId, locale);
  }
}

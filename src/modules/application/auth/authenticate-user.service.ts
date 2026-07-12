import { compare } from 'bcryptjs';

import { UnauthorizedError } from '@/modules/domain/shared/errors';
import type { UserEntity } from '@/modules/domain/user/user.entity';
import type { UserRepository } from '@/modules/domain/user/user.repository';
import type { LoginDto } from '@/shared/schemas/auth.schema';

/**
 * Authenticates a user with email/password credentials.
 */
export class AuthenticateUserService {
  constructor(private readonly users: UserRepository) {}

  async execute(input: LoginDto): Promise<UserEntity> {
    const user = await this.users.findCredentialsByEmail(input.email.toLowerCase());
    if (!user?.passwordHash) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const valid = await compare(input.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      locale: user.locale,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

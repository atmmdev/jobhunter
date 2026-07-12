import type { User as PrismaUser } from '@prisma/client';

import {
  toAppLocale,
  type AppLocale,
  type UserEntity,
} from '@/modules/domain/user/user.entity';
import type { UserRepository } from '@/modules/domain/user/user.repository';
import { prisma } from '@/modules/infrastructure/prisma/client';
import { toPrismaLocale } from '@/modules/domain/user/user.entity';

function mapUser(user: PrismaUser): UserEntity {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    locale: toAppLocale(user.locale),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * Prisma implementation of the User repository port.
 */
export class PrismaUserRepository implements UserRepository {
  async findById(id: string): Promise<UserEntity | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? mapUser(user) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    return user ? mapUser(user) : null;
  }

  async findCredentialsByEmail(
    email: string,
  ): Promise<(UserEntity & { passwordHash: string | null }) | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return null;
    }

    return {
      ...mapUser(user),
      passwordHash: user.passwordHash,
    };
  }

  async updateLocale(userId: string, locale: AppLocale): Promise<UserEntity> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { locale: toPrismaLocale(locale) },
    });
    return mapUser(user);
  }
}

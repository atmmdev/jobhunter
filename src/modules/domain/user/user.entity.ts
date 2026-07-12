export type AppLocale = 'en' | 'pt-BR';

/**
 * User aggregate as consumed by the application layer.
 */
export interface UserEntity {
  readonly id: string;
  readonly email: string;
  readonly name: string | null;
  readonly locale: AppLocale;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Maps Prisma locale enum values to application locale codes.
 */
export function toAppLocale(value: 'en' | 'pt_BR'): AppLocale {
  return value === 'pt_BR' ? 'pt-BR' : 'en';
}

/**
 * Maps application locale codes to Prisma locale enum values.
 */
export function toPrismaLocale(value: AppLocale): 'en' | 'pt_BR' {
  return value === 'pt-BR' ? 'pt_BR' : 'en';
}

import type { Source as PrismaSource } from '@prisma/client';

import {
  MANUAL_SOURCE_NAME,
  MANUAL_SOURCE_URL,
  type SourceEntity,
} from '@/modules/domain/source/source.entity';
import type { SourceRepository } from '@/modules/domain/source/source.repository';
import { prisma } from '@/modules/infrastructure/prisma/client';

function mapSource(source: PrismaSource): SourceEntity {
  return {
    id: source.id,
    name: source.name,
    baseUrl: source.baseUrl,
    enabled: source.enabled,
  };
}

/**
 * Prisma implementation of the Source repository port.
 */
export class PrismaSourceRepository implements SourceRepository {
  async findByName(name: string): Promise<SourceEntity | null> {
    const source = await prisma.source.findFirst({ where: { name } });
    return source ? mapSource(source) : null;
  }

  async ensureManualSource(): Promise<SourceEntity> {
    const existing = await this.findByName(MANUAL_SOURCE_NAME);
    if (existing) {
      return existing;
    }

    const source = await prisma.source.create({
      data: {
        name: MANUAL_SOURCE_NAME,
        type: 'OTHER',
        atsType: 'CUSTOM',
        baseUrl: MANUAL_SOURCE_URL,
        enabled: true,
      },
    });

    return mapSource(source);
  }
}

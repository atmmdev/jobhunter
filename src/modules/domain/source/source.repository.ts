import type { SourceEntity } from '@/modules/domain/source/source.entity';

/**
 * Persistence port for Source lookup/bootstrap.
 */
export interface SourceRepository {
  findByName(name: string): Promise<SourceEntity | null>;
  ensureManualSource(): Promise<SourceEntity>;
}

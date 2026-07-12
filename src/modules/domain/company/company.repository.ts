import type { CompanyEntity } from '@/modules/domain/company/company.entity';

/**
 * Persistence port for the Company aggregate.
 */
export interface CompanyRepository {
  findByName(name: string): Promise<CompanyEntity | null>;
  create(name: string): Promise<CompanyEntity>;
  findOrCreateByName(name: string): Promise<CompanyEntity>;
}

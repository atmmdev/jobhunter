import type { Company as PrismaCompany } from '@prisma/client';

import type { CompanyEntity } from '@/modules/domain/company/company.entity';
import type { CompanyRepository } from '@/modules/domain/company/company.repository';
import { prisma } from '@/modules/infrastructure/prisma/client';

function mapCompany(company: PrismaCompany): CompanyEntity {
  return {
    id: company.id,
    name: company.name,
    website: company.website,
    careersUrl: company.careersUrl,
    country: company.country,
    createdAt: company.createdAt,
    updatedAt: company.updatedAt,
  };
}

/**
 * Prisma implementation of the Company repository port.
 */
export class PrismaCompanyRepository implements CompanyRepository {
  async findByName(name: string): Promise<CompanyEntity | null> {
    const company = await prisma.company.findFirst({
      where: { name },
    });
    return company ? mapCompany(company) : null;
  }

  async create(name: string): Promise<CompanyEntity> {
    const company = await prisma.company.create({
      data: { name },
    });
    return mapCompany(company);
  }

  async findOrCreateByName(name: string): Promise<CompanyEntity> {
    const existing = await this.findByName(name);
    if (existing) {
      return existing;
    }
    return this.create(name);
  }
}

import type {
  CompanySeedRepository,
  SourceListRow,
  UpsertCompanyFromSeedInput,
  UpsertCompanyFromSeedResult,
} from '@/modules/domain/company/company-seed.repository';
import type { AtsTypeValue } from '@/modules/domain/ats/ats-type';
import type { SourceTypeValue } from '@/modules/domain/company/company-seed.repository';
import { prisma } from '@/modules/infrastructure/prisma/client';

/**
 * Prisma implementation for company/source seed upserts and source listing.
 */
export class PrismaCompanySeedRepository implements CompanySeedRepository {
  async upsertFromSeed(input: UpsertCompanyFromSeedInput): Promise<UpsertCompanyFromSeedResult> {
    const existing = await prisma.company.findFirst({
      where: {
        OR: [{ careersUrl: input.careersUrl }, { name: input.name }],
      },
      include: { sources: true },
    });

    if (existing) {
      const company = await prisma.company.update({
        where: { id: existing.id },
        data: {
          careersUrl: input.careersUrl,
          country: input.country ?? existing.country,
          atsType: input.atsType,
          sourceMeta: input.sourceMeta,
          website: existing.website ?? input.careersUrl,
        },
        include: { sources: true },
      });

      const existingSource = company.sources.find((source) => source.baseUrl === input.careersUrl);
      if (existingSource) {
        return {
          companyId: company.id,
          created: false,
          sourceId: existingSource.id,
          sourceCreated: false,
        };
      }

      const source = await prisma.source.create({
        data: {
          name: `${company.name} Careers`,
          type: toSourceType(input.atsType),
          atsType: input.atsType,
          baseUrl: input.careersUrl,
          companyId: company.id,
          enabled: true,
        },
      });

      return {
        companyId: company.id,
        created: false,
        sourceId: source.id,
        sourceCreated: true,
      };
    }

    const company = await prisma.company.create({
      data: {
        name: input.name,
        careersUrl: input.careersUrl,
        website: input.careersUrl,
        country: input.country,
        atsType: input.atsType,
        sourceMeta: input.sourceMeta,
        sources: {
          create: {
            name: `${input.name} Careers`,
            type: toSourceType(input.atsType),
            atsType: input.atsType,
            baseUrl: input.careersUrl,
            enabled: true,
          },
        },
      },
      include: { sources: true },
    });

    const source = company.sources[0];
    if (!source) {
      throw new Error('Expected source to be created with company');
    }

    return {
      companyId: company.id,
      created: true,
      sourceId: source.id,
      sourceCreated: true,
    };
  }

  async listSources(): Promise<SourceListRow[]> {
    const sources = await prisma.source.findMany({
      include: {
        company: { select: { name: true, country: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sources.map((source) => ({
      id: source.id,
      name: source.name,
      type: source.type as SourceTypeValue,
      atsType: source.atsType as AtsTypeValue | null,
      baseUrl: source.baseUrl,
      enabled: source.enabled,
      companyName: source.company?.name ?? null,
      country: source.company?.country ?? null,
      lastRunAt: source.lastRunAt,
      lastStatus: source.lastStatus,
      createdAt: source.createdAt,
    }));
  }
}

function toSourceType(atsType: AtsTypeValue): SourceTypeValue {
  return atsType === 'CUSTOM' || atsType === 'UNKNOWN' ? 'CAREERS' : 'ATS';
}

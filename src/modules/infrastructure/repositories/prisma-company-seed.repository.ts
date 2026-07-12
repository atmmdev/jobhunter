import type { Prisma } from '@prisma/client';

import type {
  CompanySeedRepository,
  ListSourcesFilter,
  ListSourcesResult,
  SortDirection,
  SourceListRow,
  SourceSortByValue,
  SourceTypeValue,
  UpsertCompanyFromSeedInput,
  UpsertCompanyFromSeedResult,
} from '@/modules/domain/company/company-seed.repository';
import type { AtsTypeValue } from '@/modules/domain/ats/ats-type';
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

  async listSources(filter: ListSourcesFilter): Promise<ListSourcesResult> {
    const skip = (filter.page - 1) * filter.pageSize;
    const orderBy = buildSourceOrderBy(filter.sortBy, filter.sortDir);

    const [sources, total] = await prisma.$transaction([
      prisma.source.findMany({
        include: {
          company: { select: { name: true, country: true } },
        },
        orderBy,
        skip,
        take: filter.pageSize,
      }),
      prisma.source.count(),
    ]);

    return {
      items: sources.map((source) => ({
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
      })),
      total,
      page: filter.page,
      pageSize: filter.pageSize,
    };
  }
}

function toSourceType(atsType: AtsTypeValue): SourceTypeValue {
  return atsType === 'CUSTOM' || atsType === 'UNKNOWN' ? 'CAREERS' : 'ATS';
}

function buildSourceOrderBy(
  sortBy: SourceSortByValue,
  sortDir: SortDirection,
): Prisma.SourceOrderByWithRelationInput {
  switch (sortBy) {
    case 'company':
      return { company: { name: sortDir } };
    case 'ats':
      return { atsType: sortDir };
    case 'country':
      return { company: { country: sortDir } };
    case 'enabled':
      return { enabled: sortDir };
    case 'url':
      return { baseUrl: sortDir };
    case 'name':
    default:
      return { name: sortDir };
  }
}

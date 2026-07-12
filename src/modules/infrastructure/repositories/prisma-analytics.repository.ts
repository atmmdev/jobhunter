import type {
  AnalyticsRepository,
  DashboardStats,
} from '@/modules/domain/analytics/analytics.repository';
import { prisma } from '@/modules/infrastructure/prisma/client';

/**
 * Prisma aggregations for the main dashboard.
 */
export class PrismaAnalyticsRepository implements AnalyticsRepository {
  async getDashboardStats(): Promise<DashboardStats> {
    const [
      jobsFound,
      applications,
      favorites,
      rejected,
      interviews,
      offers,
      applied,
      techGroups,
      countryGroups,
      atsGroups,
      salaryAgg,
    ] = await prisma.$transaction([
      prisma.job.count(),
      prisma.application.count(),
      prisma.job.count({ where: { status: 'FAVORITED' } }),
      prisma.job.count({ where: { status: 'REJECTED' } }),
      prisma.job.count({ where: { status: 'INTERVIEW' } }),
      prisma.job.count({ where: { status: 'OFFER' } }),
      prisma.job.count({ where: { status: 'APPLIED' } }),
      prisma.jobTechnology.groupBy({
        by: ['technologyId'],
        _count: true,
        orderBy: { _count: { technologyId: 'desc' } },
        take: 5,
      }),
      prisma.job.groupBy({
        by: ['country'],
        where: { country: { not: null } },
        _count: true,
        orderBy: { _count: { country: 'desc' } },
        take: 5,
      }),
      prisma.source.groupBy({
        by: ['atsType'],
        where: { atsType: { not: null } },
        _count: true,
        orderBy: { _count: { atsType: 'desc' } },
        take: 8,
      }),
      prisma.job.aggregate({
        _avg: { salaryMin: true, salaryMax: true },
      }),
    ]);

    const techIds = techGroups.map((group) => group.technologyId);
    const technologies =
      techIds.length > 0
        ? await prisma.technology.findMany({ where: { id: { in: techIds } } })
        : [];
    const techNameById = new Map(technologies.map((tech) => [tech.id, tech.name]));

    const responses = interviews + offers;
    const responseRate = applied > 0 ? Math.round((responses / applied) * 100) : null;

    return {
      jobsFound,
      applications,
      favorites,
      rejected,
      interviews,
      offers,
      responseRate,
      topTechnologies: techGroups.map((group) => ({
        name: techNameById.get(group.technologyId) ?? 'Unknown',
        count: asGroupCount(group._count),
      })),
      countries: countryGroups
        .filter((group) => group.country)
        .map((group) => ({
          name: group.country as string,
          count: asGroupCount(group._count),
        })),
      atsStatistics: atsGroups
        .filter((group) => group.atsType)
        .map((group) => ({
          name: group.atsType as string,
          count: asGroupCount(group._count),
        })),
      averageSalaryMin: salaryAgg._avg.salaryMin ? Number(salaryAgg._avg.salaryMin) : null,
      averageSalaryMax: salaryAgg._avg.salaryMax ? Number(salaryAgg._avg.salaryMax) : null,
    };
  }
}

/**
 * Normalizes Prisma groupBy `_count` shapes to a number.
 */
function asGroupCount(value: unknown): number {
  if (typeof value === 'number') {
    return value;
  }
  if (value && typeof value === 'object') {
    const values = Object.values(value as Record<string, unknown>).filter(
      (entry): entry is number => typeof entry === 'number',
    );
    return values[0] ?? 0;
  }
  return 0;
}

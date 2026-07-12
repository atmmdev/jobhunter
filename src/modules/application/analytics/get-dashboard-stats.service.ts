import type {
  AnalyticsRepository,
  DashboardStats,
} from '@/modules/domain/analytics/analytics.repository';

/**
 * Returns dashboard KPI aggregations.
 */
export class GetDashboardStatsService {
  constructor(private readonly analytics: AnalyticsRepository) {}

  async execute(): Promise<DashboardStats> {
    return this.analytics.getDashboardStats();
  }
}

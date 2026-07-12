export interface DashboardStats {
  jobsFound: number;
  applications: number;
  favorites: number;
  rejected: number;
  interviews: number;
  offers: number;
  responseRate: number | null;
  topTechnologies: Array<{ name: string; count: number }>;
  countries: Array<{ name: string; count: number }>;
  atsStatistics: Array<{ name: string; count: number }>;
  averageSalaryMin: number | null;
  averageSalaryMax: number | null;
}

/**
 * Persistence port for dashboard aggregations.
 */
export interface AnalyticsRepository {
  getDashboardStats(): Promise<DashboardStats>;
}

import type { ApplicationRepository } from '@/modules/domain/application/application.repository';
import type { ListApplicationsQueryDto } from '@/shared/schemas/application.schema';

/**
 * Lists applications for the signed-in user.
 */
export class ListApplicationsService {
  constructor(private readonly applications: ApplicationRepository) {}

  async execute(userId: string, query: ListApplicationsQueryDto) {
    return this.applications.list({
      userId,
      status: query.status,
      limit: query.limit,
      offset: query.offset,
    });
  }
}

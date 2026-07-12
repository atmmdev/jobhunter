import type { ApplicationEntity } from '@/modules/domain/application/application.entity';
import { listAllowedApplicationTransitions } from '@/modules/domain/application/application-status.policy';

/**
 * JSON-safe application DTO for Client Components.
 */
export interface ApplicationListItemDto {
  id: string;
  jobId: string;
  resumeId: string;
  status: ApplicationEntity['status'];
  approvedAt: string | null;
  appliedAt: string | null;
  failureMessage: string | null;
  jobTitle: string;
  companyName: string | null;
  applyUrl: string;
  resumeName: string;
  createdAt: string;
  updatedAt: string;
  allowedTransitions: ReturnType<typeof listAllowedApplicationTransitions>;
}

/**
 * Maps an Application entity to a serializable list DTO.
 */
export function toApplicationListItemDto(app: ApplicationEntity): ApplicationListItemDto {
  return {
    id: app.id,
    jobId: app.jobId,
    resumeId: app.resumeId,
    status: app.status,
    approvedAt: app.approvedAt?.toISOString() ?? null,
    appliedAt: app.appliedAt?.toISOString() ?? null,
    failureMessage: app.failureMessage,
    jobTitle: app.jobTitle,
    companyName: app.companyName,
    applyUrl: app.applyUrl,
    resumeName: app.resumeName,
    createdAt: app.createdAt.toISOString(),
    updatedAt: app.updatedAt.toISOString(),
    allowedTransitions: listAllowedApplicationTransitions(app.status),
  };
}

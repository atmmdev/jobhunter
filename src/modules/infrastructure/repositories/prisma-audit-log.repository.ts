import type {
  AuditLogRepository,
  CreateAuditLogInput,
} from '@/modules/domain/audit/audit-log.repository';
import { prisma } from '@/modules/infrastructure/prisma/client';

/**
 * Prisma implementation of the AuditLog repository port.
 */
export class PrismaAuditLogRepository implements AuditLogRepository {
  async create(input: CreateAuditLogInput): Promise<void> {
    await prisma.auditLog.create({
      data: {
        actorType: input.actorType,
        actorId: input.actorId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        metadata: input.metadata
          ? (JSON.parse(JSON.stringify(input.metadata)) as object)
          : undefined,
      },
    });
  }
}

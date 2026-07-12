export interface CreateAuditLogInput {
  actorType: 'USER' | 'SYSTEM';
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
}

/**
 * Persistence port for audit trail entries.
 */
export interface AuditLogRepository {
  create(input: CreateAuditLogInput): Promise<void>;
}

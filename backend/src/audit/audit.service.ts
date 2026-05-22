import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditEvent {
  userId?: string;
  workspaceId?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Append-only event log. Writes are best-effort: an audit failure must
 * never break the business operation that triggered it, so we catch and
 * log instead of propagating.
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async record(event: AuditEvent): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: event.userId,
          workspaceId: event.workspaceId,
          action: event.action,
          resourceType: event.resourceType,
          resourceId: event.resourceId,
          metadata: event.metadata as object | undefined,
          ipAddress: event.ipAddress,
          userAgent: event.userAgent?.slice(0, 500),
        },
      });
    } catch (err) {
      this.logger.error(
        { err: (err as Error).message, action: event.action },
        'Failed to record audit event',
      );
    }
  }

  list(workspaceId: string, opts: { limit: number; offset: number; action?: string }) {
    const where = { workspaceId, ...(opts.action ? { action: opts.action } : {}) };
    return Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: opts.limit,
        skip: opts.offset,
      }),
      this.prisma.auditLog.count({ where }),
    ]);
  }
}

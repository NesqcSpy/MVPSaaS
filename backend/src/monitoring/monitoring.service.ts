import { Injectable } from '@nestjs/common';
import { DocumentStatus, JobStatus } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { WorkflowEngineService } from '../workflows/workflow-engine.service';

@Injectable()
export class MonitoringService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly engine: WorkflowEngineService,
  ) {}

  /**
   * Top-of-funnel numbers shown on the dashboard. One round trip per
   * metric to keep the query plans simple — the heavy lifting is the
   * Prisma `groupBy` which Postgres handles fine.
   */
  async overview(workspaceId: string) {
    const [
      docTotals,
      docByStatus,
      jobByStatus,
      avgOcr,
      avgExtraction,
      avgExport,
      last24h,
      queueHealth,
    ] = await Promise.all([
      this.prisma.document.count({ where: { workspaceId, deletedAt: null } }),
      this.prisma.document.groupBy({
        by: ['status'],
        where: { workspaceId, deletedAt: null },
        _count: { _all: true },
      }),
      this.prisma.workflowJob.groupBy({
        by: ['status'],
        where: { workspaceId },
        _count: { _all: true },
      }),
      this.prisma.oCRResult.aggregate({
        where: { document: { workspaceId } },
        _avg: { durationMs: true },
      }),
      this.prisma.extractionResult.aggregate({
        where: { document: { workspaceId } },
        _avg: { durationMs: true, overallScore: true },
      }),
      this.prisma.workflowJob.aggregate({
        where: {
          workspaceId,
          type: { startsWith: 'etl.export:' },
          finishedAt: { not: null },
        },
        _count: { _all: true },
      }),
      this.prisma.workflowJob.count({
        where: {
          workspaceId,
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      }),
      this.engine.queueHealth(),
    ]);

    const byStatus = (rows: Array<{ status: string; _count: { _all: number } }>) =>
      Object.fromEntries(rows.map((r) => [r.status, r._count._all]));

    return {
      documents: {
        total: docTotals,
        byStatus: byStatus(docByStatus as unknown as { status: string; _count: { _all: number } }[]),
      },
      jobs: {
        byStatus: byStatus(jobByStatus as unknown as { status: string; _count: { _all: number } }[]),
        last24h,
      },
      latency: {
        ocrMs: Math.round(avgOcr._avg.durationMs ?? 0),
        extractionMs: Math.round(avgExtraction._avg.durationMs ?? 0),
        avgExtractionScore: Number((avgExtraction._avg.overallScore ?? 0).toFixed(2)),
      },
      exports: {
        completed: avgExport._count._all,
      },
      queues: queueHealth,
    };
  }

  /** Recent failed jobs across all queues, useful for an "incidents" tab. */
  async recentFailures(workspaceId: string, limit = 25) {
    return this.prisma.workflowJob.findMany({
      where: { workspaceId, status: { in: [JobStatus.FAILED, JobStatus.DEAD_LETTER] } },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      select: {
        id: true,
        type: true,
        status: true,
        attempts: true,
        error: true,
        documentId: true,
        pipelineId: true,
        updatedAt: true,
      },
    });
  }

  /** Throughput series for the last N hours, bucketed per hour. */
  async throughput(workspaceId: string, hours = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    const rows = await this.prisma.$queryRaw<Array<{ bucket: Date; count: bigint; status: JobStatus }>>`
      SELECT date_trunc('hour', "createdAt") AS bucket, COUNT(*) AS count, status
      FROM "WorkflowJob"
      WHERE "workspaceId" = ${workspaceId}
        AND "createdAt" >= ${since}
      GROUP BY 1, 3
      ORDER BY 1 ASC
    `;
    return rows.map((r) => ({
      bucket: r.bucket.toISOString(),
      count: Number(r.count),
      status: r.status,
    }));
  }

  /** Latest documents — handy for the "Activity" panel on the dashboard. */
  recentDocuments(workspaceId: string, limit = 10) {
    return this.prisma.document.findMany({
      where: { workspaceId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        filename: true,
        status: true,
        kind: true,
        createdAt: true,
        extractionResult: { select: { overallScore: true, template: true } },
        validationResult: { select: { status: true } },
      },
    });
  }

  documentStatusEnum = DocumentStatus;
}

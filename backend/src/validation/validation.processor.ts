import { Logger } from '@nestjs/common';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, UnrecoverableError } from 'bullmq';
import { ValidationStatus } from '@prisma/client';

import { QUEUE } from '../workflows/queue.constants';
import { WorkflowEngineService } from '../workflows/workflow-engine.service';
import { MetricsService } from '../observability/metrics.service';
import { PrismaService } from '../prisma/prisma.service';
import { ValidationService } from './validation.service';

interface ValidationJobPayload {
  jobRowId: string;
  documentId: string;
}

@Processor(QUEUE.VALIDATION, { concurrency: 8 })
export class ValidationProcessor extends WorkerHost {
  private readonly logger = new Logger(ValidationProcessor.name);

  constructor(
    private readonly validation: ValidationService,
    private readonly engine: WorkflowEngineService,
    private readonly metrics: MetricsService,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job<ValidationJobPayload>) {
    const { jobRowId, documentId } = job.data;
    const start = Date.now();
    await this.engine.markRunning(jobRowId);

    try {
      const report = await this.validation.runForDocument(documentId);
      await this.engine.markCompleted(jobRowId, {
        status: report.status,
        issueCount: report.issues.length,
      });

      // On successful validation, queue the ETL export step automatically
      // if there is any active pipeline targeting this document's workspace.
      if (report.status !== ValidationStatus.FAILED) {
        const dbJob = await this.prisma.workflowJob.findUnique({
          where: { id: jobRowId },
          select: { workspaceId: true, correlationId: true },
        });
        if (dbJob) {
          const pipelines = await this.prisma.pipeline.findMany({
            where: {
              workspaceId: dbJob.workspaceId,
              status: 'ACTIVE',
              deletedAt: null,
            },
            select: { id: true },
          });
          for (const p of pipelines) {
            await this.engine.enqueue(
              QUEUE.ETL_EXPORT,
              'export',
              { documentId, pipelineId: p.id },
              {
                workspaceId: dbJob.workspaceId,
                documentId,
                pipelineId: p.id,
                correlationId: dbJob.correlationId ?? undefined,
              },
            );
          }
        }
      }

      this.metrics.jobsProcessed.inc({ queue: QUEUE.VALIDATION, status: 'completed' });
      this.metrics.jobDuration.observe(
        { queue: QUEUE.VALIDATION, status: 'completed' },
        (Date.now() - start) / 1000,
      );

      return { documentId, status: report.status, issues: report.issues.length };
    } catch (err) {
      const willRetry = job.attemptsMade < (job.opts.attempts ?? 1);
      await this.engine.markFailed(jobRowId, err as Error, willRetry);
      this.metrics.jobsProcessed.inc({
        queue: QUEUE.VALIDATION,
        status: willRetry ? 'retry' : 'failed',
      });
      const msg = (err as Error).message ?? '';
      if (/Extraction result missing/.test(msg)) throw new UnrecoverableError(msg);
      throw err;
    }
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<ValidationJobPayload>, err: Error): void {
    this.logger.error(
      { jobId: job.id, documentId: job.data?.documentId, err: err.message },
      'Validation job failed',
    );
  }
}

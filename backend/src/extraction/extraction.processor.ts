import { Logger } from '@nestjs/common';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, UnrecoverableError } from 'bullmq';

import { QUEUE } from '../workflows/queue.constants';
import { WorkflowEngineService } from '../workflows/workflow-engine.service';
import { MetricsService } from '../observability/metrics.service';
import { PrismaService } from '../prisma/prisma.service';
import { ExtractionService } from './extraction.service';

interface ExtractionJobPayload {
  jobRowId: string;
  documentId: string;
}

@Processor(QUEUE.EXTRACTION, { concurrency: 8 })
export class ExtractionProcessor extends WorkerHost {
  private readonly logger = new Logger(ExtractionProcessor.name);

  constructor(
    private readonly extraction: ExtractionService,
    private readonly engine: WorkflowEngineService,
    private readonly metrics: MetricsService,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job<ExtractionJobPayload>) {
    const { jobRowId, documentId } = job.data;
    const start = Date.now();
    await this.engine.markRunning(jobRowId);

    try {
      const result = await this.extraction.runForDocument(documentId);
      await this.engine.markCompleted(jobRowId, {
        template: result.template,
        overallScore: result.overallScore,
      });

      // Chain into validation with the same correlation id.
      const dbJob = await this.prisma.workflowJob.findUnique({
        where: { id: jobRowId },
        select: { workspaceId: true, correlationId: true },
      });
      if (dbJob) {
        await this.engine.enqueue(
          QUEUE.VALIDATION,
          'validate',
          { documentId },
          {
            workspaceId: dbJob.workspaceId,
            documentId,
            correlationId: dbJob.correlationId ?? undefined,
          },
        );
      }

      this.metrics.jobsProcessed.inc({ queue: QUEUE.EXTRACTION, status: 'completed' });
      this.metrics.jobDuration.observe(
        { queue: QUEUE.EXTRACTION, status: 'completed' },
        (Date.now() - start) / 1000,
      );

      return { documentId, template: result.template, score: result.overallScore };
    } catch (err) {
      const willRetry = job.attemptsMade < (job.opts.attempts ?? 1);
      await this.engine.markFailed(jobRowId, err as Error, willRetry);
      this.metrics.jobsProcessed.inc({
        queue: QUEUE.EXTRACTION,
        status: willRetry ? 'retry' : 'failed',
      });
      // Missing OCR result will never succeed on retry.
      const msg = (err as Error).message ?? '';
      if (/OCR result missing/.test(msg)) throw new UnrecoverableError(msg);
      throw err;
    }
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<ExtractionJobPayload>, err: Error): void {
    this.logger.error(
      { jobId: job.id, documentId: job.data?.documentId, err: err.message },
      'Extraction job failed',
    );
  }
}

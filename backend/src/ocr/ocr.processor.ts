import { Logger } from '@nestjs/common';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, UnrecoverableError } from 'bullmq';

import { QUEUE } from '../workflows/queue.constants';
import { WorkflowEngineService } from '../workflows/workflow-engine.service';
import { MetricsService } from '../observability/metrics.service';
import { PrismaService } from '../prisma/prisma.service';
import { OcrService } from './ocr.service';

interface OcrJobPayload {
  jobRowId: string;
  documentId: string;
  storageKey: string;
  mimeType: string;
}

@Processor(QUEUE.OCR, { concurrency: 4 })
export class OcrProcessor extends WorkerHost {
  private readonly logger = new Logger(OcrProcessor.name);

  constructor(
    private readonly ocr: OcrService,
    private readonly engine: WorkflowEngineService,
    private readonly metrics: MetricsService,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job<OcrJobPayload>): Promise<{ documentId: string; pages: number }> {
    const { jobRowId, documentId } = job.data;
    const start = Date.now();
    await this.engine.markRunning(jobRowId);

    try {
      const result = await this.ocr.runForDocument(documentId);
      await this.engine.markCompleted(jobRowId, {
        pages: result.pages.length,
        provider: result.provider,
        durationMs: result.durationMs,
      });

      // Chain into extraction, preserving the workspace + correlation id.
      const dbJob = await this.prisma.workflowJob.findUnique({
        where: { id: jobRowId },
        select: { workspaceId: true, correlationId: true },
      });
      if (dbJob) {
        await this.engine.enqueue(
          QUEUE.EXTRACTION,
          'extract',
          { documentId },
          {
            workspaceId: dbJob.workspaceId,
            documentId,
            correlationId: dbJob.correlationId ?? undefined,
          },
        );
      }

      this.metrics.jobsProcessed.inc({ queue: QUEUE.OCR, status: 'completed' });
      this.metrics.jobDuration.observe(
        { queue: QUEUE.OCR, status: 'completed' },
        (Date.now() - start) / 1000,
      );

      return { documentId, pages: result.pages.length };
    } catch (err) {
      const willRetry = job.attemptsMade < (job.opts.attempts ?? 1);
      await this.engine.markFailed(jobRowId, err as Error, willRetry);
      this.metrics.jobsProcessed.inc({
        queue: QUEUE.OCR,
        status: willRetry ? 'retry' : 'failed',
      });

      // 4xx-style provider errors are unrecoverable — don't burn retries.
      const msg = (err as Error).message ?? '';
      if (/Mistral OCR 4\d\d/.test(msg) || /Unsupported mime type/.test(msg)) {
        throw new UnrecoverableError(msg);
      }
      throw err;
    }
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<OcrJobPayload>, err: Error): void {
    this.logger.error(
      { jobId: job.id, documentId: job.data?.documentId, attempts: job.attemptsMade, err: err.message },
      'OCR job failed',
    );
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<OcrJobPayload>): void {
    this.logger.log(`OCR job ${job.id} completed (doc=${job.data?.documentId})`);
  }
}

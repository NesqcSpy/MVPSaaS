import { Logger } from '@nestjs/common';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, UnrecoverableError } from 'bullmq';
import { DocumentStatus } from '@prisma/client';

import { QUEUE } from '../workflows/queue.constants';
import { WorkflowEngineService } from '../workflows/workflow-engine.service';
import { MetricsService } from '../observability/metrics.service';
import { PrismaService } from '../prisma/prisma.service';
import { EtlService } from './etl.service';

interface EtlJobPayload {
  jobRowId: string;
  documentId: string;
  pipelineId: string;
}

@Processor(QUEUE.ETL_EXPORT, { concurrency: 4 })
export class EtlProcessor extends WorkerHost {
  private readonly logger = new Logger(EtlProcessor.name);

  constructor(
    private readonly etl: EtlService,
    private readonly engine: WorkflowEngineService,
    private readonly metrics: MetricsService,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job<EtlJobPayload>) {
    const { jobRowId, documentId, pipelineId } = job.data;
    const start = Date.now();
    await this.engine.markRunning(jobRowId);

    try {
      await this.prisma.document.update({
        where: { id: documentId },
        data: { status: DocumentStatus.EXPORTING },
      });

      const result = await this.etl.runPipeline(pipelineId, { documentIds: [documentId] });
      await this.engine.markCompleted(jobRowId, {
        rowsWritten: result.rowsWritten,
        destination: result.destination,
        transformation: result.transformation,
      });

      await this.prisma.document.update({
        where: { id: documentId },
        data: { status: DocumentStatus.EXPORTED, error: null },
      });

      this.metrics.jobsProcessed.inc({ queue: QUEUE.ETL_EXPORT, status: 'completed' });
      this.metrics.jobDuration.observe(
        { queue: QUEUE.ETL_EXPORT, status: 'completed' },
        (Date.now() - start) / 1000,
      );

      return result;
    } catch (err) {
      const willRetry = job.attemptsMade < (job.opts.attempts ?? 1);
      await this.engine.markFailed(jobRowId, err as Error, willRetry);
      this.metrics.jobsProcessed.inc({
        queue: QUEUE.ETL_EXPORT,
        status: willRetry ? 'retry' : 'failed',
      });
      const msg = (err as Error).message ?? '';
      if (/Pipeline definition is malformed|Integration is missing or disabled/.test(msg)) {
        await this.prisma.document.update({
          where: { id: documentId },
          data: { status: DocumentStatus.FAILED, error: `ETL: ${msg.slice(0, 500)}` },
        }).catch(() => undefined);
        throw new UnrecoverableError(msg);
      }
      throw err;
    }
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<EtlJobPayload>, err: Error): void {
    this.logger.error(
      { jobId: job.id, documentId: job.data?.documentId, pipelineId: job.data?.pipelineId, err: err.message },
      'ETL export job failed',
    );
  }
}

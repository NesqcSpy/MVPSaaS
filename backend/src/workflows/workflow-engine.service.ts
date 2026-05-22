import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { JobStatus } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { QUEUE, DEFAULT_JOB_OPTS, QueueName } from './queue.constants';

export interface EnqueueOptions {
  workspaceId: string;
  documentId?: string;
  pipelineId?: string;
  correlationId?: string;
  maxAttempts?: number;
}

/**
 * Thin orchestration layer over BullMQ. Every enqueue is mirrored to the
 * WorkflowJob table so the UI can show history/state without scraping Redis.
 */
@Injectable()
export class WorkflowEngineService {
  private readonly logger = new Logger(WorkflowEngineService.name);

  constructor(
    @InjectQueue(QUEUE.OCR) private readonly ocrQueue: Queue,
    @InjectQueue(QUEUE.EXTRACTION) private readonly extractionQueue: Queue,
    @InjectQueue(QUEUE.VALIDATION) private readonly validationQueue: Queue,
    @InjectQueue(QUEUE.ETL_EXPORT) private readonly etlQueue: Queue,
    @InjectQueue(QUEUE.WORKFLOW) private readonly workflowQueue: Queue,
    private readonly prisma: PrismaService,
  ) {}

  private queueFor(name: QueueName): Queue {
    switch (name) {
      case QUEUE.OCR: return this.ocrQueue;
      case QUEUE.EXTRACTION: return this.extractionQueue;
      case QUEUE.VALIDATION: return this.validationQueue;
      case QUEUE.ETL_EXPORT: return this.etlQueue;
      case QUEUE.WORKFLOW: return this.workflowQueue;
    }
  }

  async enqueue<T extends object>(
    queueName: QueueName,
    jobName: string,
    payload: T,
    opts: EnqueueOptions,
  ): Promise<string> {
    const job = await this.prisma.workflowJob.create({
      data: {
        workspaceId: opts.workspaceId,
        documentId: opts.documentId,
        pipelineId: opts.pipelineId,
        type: `${queueName}:${jobName}`,
        status: JobStatus.QUEUED,
        payload: payload as object,
        correlationId: opts.correlationId,
        maxAttempts: opts.maxAttempts ?? DEFAULT_JOB_OPTS.attempts,
      },
    });

    await this.queueFor(queueName).add(jobName, { ...payload, jobRowId: job.id }, {
      ...DEFAULT_JOB_OPTS,
      attempts: opts.maxAttempts ?? DEFAULT_JOB_OPTS.attempts,
      jobId: job.id,
    });

    this.logger.log(`Enqueued ${queueName}:${jobName} (jobRowId=${job.id})`);
    return job.id;
  }

  async markRunning(jobRowId: string): Promise<void> {
    await this.prisma.workflowJob.update({
      where: { id: jobRowId },
      data: { status: JobStatus.RUNNING, startedAt: new Date(), attempts: { increment: 1 } },
    });
  }

  async markCompleted(jobRowId: string, result: unknown): Promise<void> {
    await this.prisma.workflowJob.update({
      where: { id: jobRowId },
      data: { status: JobStatus.COMPLETED, finishedAt: new Date(), result: result as object },
    });
  }

  async markFailed(jobRowId: string, err: Error, willRetry: boolean): Promise<void> {
    await this.prisma.workflowJob.update({
      where: { id: jobRowId },
      data: {
        status: willRetry ? JobStatus.RETRYING : JobStatus.FAILED,
        finishedAt: willRetry ? undefined : new Date(),
        error: err.message?.slice(0, 1000),
      },
    });
  }

  async queueHealth() {
    const queues: QueueName[] = [QUEUE.OCR, QUEUE.EXTRACTION, QUEUE.VALIDATION, QUEUE.ETL_EXPORT, QUEUE.WORKFLOW];
    return Promise.all(
      queues.map(async (name) => {
        const q = this.queueFor(name);
        const [waiting, active, completed, failed, delayed] = await Promise.all([
          q.getWaitingCount(),
          q.getActiveCount(),
          q.getCompletedCount(),
          q.getFailedCount(),
          q.getDelayedCount(),
        ]);
        return { name, waiting, active, completed, failed, delayed };
      }),
    );
  }
}

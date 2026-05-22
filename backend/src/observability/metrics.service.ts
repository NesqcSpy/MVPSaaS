import { Injectable, OnModuleInit } from '@nestjs/common';
import { collectDefaultMetrics, Counter, Histogram, Registry } from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  readonly registry = new Registry();

  readonly httpRequests = new Counter({
    name: 'dataclean_http_requests_total',
    help: 'Total HTTP requests',
    labelNames: ['method', 'route', 'status'],
    registers: [this.registry],
  });

  readonly httpDuration = new Histogram({
    name: 'dataclean_http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5, 10],
    registers: [this.registry],
  });

  readonly jobsProcessed = new Counter({
    name: 'dataclean_jobs_processed_total',
    help: 'Background jobs processed',
    labelNames: ['queue', 'status'],
    registers: [this.registry],
  });

  readonly jobDuration = new Histogram({
    name: 'dataclean_job_duration_seconds',
    help: 'Background job duration',
    labelNames: ['queue', 'status'],
    buckets: [0.1, 0.5, 1, 5, 10, 30, 60, 300],
    registers: [this.registry],
  });

  readonly ocrLatency = new Histogram({
    name: 'dataclean_ocr_latency_seconds',
    help: 'OCR provider latency in seconds',
    labelNames: ['provider'],
    buckets: [0.5, 1, 2, 5, 10, 20, 30, 60],
    registers: [this.registry],
  });

  onModuleInit(): void {
    collectDefaultMetrics({ register: this.registry, prefix: 'dataclean_' });
  }

  async serialize(): Promise<string> {
    return this.registry.metrics();
  }
}

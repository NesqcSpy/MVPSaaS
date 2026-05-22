import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { MetricsService } from '../../observability/metrics.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly metrics: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') return next.handle();
    const http = context.switchToHttp();
    const req = http.getRequest<{ method: string; route?: { path?: string }; url: string }>();
    const res = http.getResponse<{ statusCode: number }>();
    const start = process.hrtime.bigint();
    const route = req.route?.path ?? req.url;

    return next.handle().pipe(
      tap({
        next: () => this.record(req.method, route, res.statusCode, start),
        error: () => this.record(req.method, route, 500, start),
      }),
    );
  }

  private record(method: string, route: string, status: number, start: bigint): void {
    const seconds = Number(process.hrtime.bigint() - start) / 1e9;
    const labels = { method, route, status: String(status) };
    this.metrics.httpRequests.inc(labels);
    this.metrics.httpDuration.observe(labels, seconds);
  }
}

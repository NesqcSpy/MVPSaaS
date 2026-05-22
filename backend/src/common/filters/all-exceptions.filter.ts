import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import type { Request, Response } from 'express';

/**
 * Single point of error normalization. Hides internals in prod,
 * preserves correlation IDs, logs with full context.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request & { id?: string }>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const payload = this.serialize(exception, status, req);

    if (status >= 500) {
      this.logger.error(
        { err: exception, path: req.url, method: req.method, correlationId: req.id },
        'Unhandled exception',
      );
    } else if (status >= 400) {
      this.logger.warn({ path: req.url, method: req.method, status }, 'Client error');
    }

    res.status(status).json(payload);
  }

  private serialize(
    exception: unknown,
    status: number,
    req: Request & { id?: string },
  ): Record<string, unknown> {
    const base = {
      statusCode: status,
      path: req.url,
      method: req.method,
      timestamp: new Date().toISOString(),
      correlationId: req.id,
    };

    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'string') return { ...base, message: response };
      return { ...base, ...(response as object) };
    }

    if (process.env.NODE_ENV === 'production') {
      return { ...base, message: 'Internal server error' };
    }

    const err = exception as { message?: string; stack?: string };
    return { ...base, message: err.message ?? 'Internal server error', stack: err.stack };
  }
}

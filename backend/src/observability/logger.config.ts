import { Params } from 'nestjs-pino';
import { randomUUID } from 'crypto';

export function pinoConfig(): Params {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    pinoHttp: {
      level: process.env.LOG_LEVEL ?? 'info',
      genReqId: (req, res) => {
        const headerId =
          (req.headers['x-request-id'] as string | undefined) ??
          (req.headers['x-correlation-id'] as string | undefined);
        const id = headerId ?? randomUUID();
        res.setHeader('x-request-id', id);
        return id;
      },
      customProps: (req) => ({
        correlationId: (req as { id?: string }).id,
      }),
      redact: {
        paths: [
          'req.headers.authorization',
          'req.headers.cookie',
          'req.body.password',
          'req.body.passwordHash',
          'req.body.refreshToken',
          'res.headers["set-cookie"]',
        ],
        censor: '[redacted]',
      },
      transport: isProd
        ? undefined
        : {
            target: 'pino-pretty',
            options: { singleLine: true, translateTime: 'SYS:HH:MM:ss.l', ignore: 'pid,hostname' },
          },
    },
  };
}

import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use = (req: Request & { id?: string }, res: Response, next: NextFunction): void => {
    const incoming =
      (req.headers['x-correlation-id'] as string | undefined) ??
      (req.headers['x-request-id'] as string | undefined);
    const id = incoming ?? randomUUID();
    req.id = id;
    res.setHeader('x-correlation-id', id);
    next();
  };
}

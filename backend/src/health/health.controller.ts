import { Controller, Get } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService, HealthIndicatorResult } from '@nestjs/terminus';
import Redis from 'ioredis';
import { PrismaService } from '../prisma/prisma.service';

@ApiExcludeController()
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      async (): Promise<HealthIndicatorResult> => {
        await this.prisma.$queryRaw`SELECT 1`;
        return { database: { status: 'up' } };
      },
      async (): Promise<HealthIndicatorResult> => {
        const url = process.env.REDIS_URL;
        if (!url) return { redis: { status: 'down', reason: 'REDIS_URL not set' } };
        const client = new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 1 });
        try {
          await client.connect();
          const pong = await client.ping();
          return { redis: { status: pong === 'PONG' ? 'up' : 'down' } };
        } finally {
          client.disconnect();
        }
      },
    ]);
  }

  @Get('live')
  live() {
    return { status: 'ok', uptime: process.uptime() };
  }
}

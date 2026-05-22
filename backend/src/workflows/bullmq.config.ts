import { BullModuleOptions } from '@nestjs/bullmq';

export function bullConnection(redisUrl: string): BullModuleOptions['connection'] {
  const url = new URL(redisUrl);
  return {
    host: url.hostname,
    port: Number(url.port || 6379),
    password: url.password || undefined,
    username: url.username || undefined,
    db: url.pathname ? Number(url.pathname.replace('/', '') || 0) : 0,
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
  };
}

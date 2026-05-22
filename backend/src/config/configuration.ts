import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type NodeEnv = 'development' | 'test' | 'production';

/**
 * Strongly-typed config facade. Inject this anywhere instead of ConfigService —
 * env access goes through one place so renames and validation stay in sync.
 */
@Injectable()
export class AppConfig {
  constructor(private readonly raw: ConfigService) {}

  private str(key: string, fallback = ''): string {
    return this.raw.get<string>(key) ?? fallback;
  }
  private num(key: string, fallback = 0): number {
    const v = this.raw.get<string | number>(key);
    if (v === undefined || v === null) return fallback;
    return typeof v === 'number' ? v : Number(v);
  }

  get nodeEnv(): NodeEnv {
    return (this.str('NODE_ENV', 'development') as NodeEnv) ?? 'development';
  }
  get isProd(): boolean { return this.nodeEnv === 'production'; }
  get port(): number { return this.num('PORT', 4000); }

  get databaseUrl(): string { return this.str('DATABASE_URL'); }
  get redisUrl(): string { return this.str('REDIS_URL'); }

  get jwt() {
    return {
      accessSecret: this.str('JWT_SECRET'),
      refreshSecret: this.str('JWT_REFRESH_SECRET'),
      accessTtl: this.str('JWT_ACCESS_TTL', '15m'),
      refreshTtl: this.str('JWT_REFRESH_TTL', '7d'),
    };
  }

  get ocr() {
    return {
      provider: this.str('OCR_PROVIDER', 'mock'),
      mistralKey: this.str('MISTRAL_API_KEY'),
      mistralUrl: this.str('MISTRAL_API_URL', 'https://api.mistral.ai/v1'),
    };
  }

  get encryptionKey(): string { return this.str('API_ENCRYPTION_KEY'); }

  get smtp() {
    return {
      host: this.str('SMTP_HOST'),
      port: this.num('SMTP_PORT', 587),
      user: this.str('SMTP_USER'),
      pass: this.str('SMTP_PASS'),
      from: this.str('SMTP_FROM', 'DataClean <noreply@dataclean.local>'),
    };
  }

  get logLevel(): string { return this.str('LOG_LEVEL', 'info'); }

  get storage() {
    return {
      driver: this.str('STORAGE_DRIVER', 'local') as 'local' | 's3',
      localPath: this.str('STORAGE_LOCAL_PATH', './storage'),
    };
  }

  get otel() {
    return {
      endpoint: this.str('OTEL_EXPORTER_OTLP_ENDPOINT'),
      serviceName: this.str('OTEL_SERVICE_NAME', 'dataclean-backend'),
    };
  }

  get corsOrigins(): string[] {
    return this.str('CORS_ORIGINS', 'http://localhost:3000')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
}

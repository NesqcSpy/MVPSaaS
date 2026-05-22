import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';

import { envValidationSchema } from './config/env.validation';
import { AppConfig } from './config/configuration';
import { pinoConfig } from './observability/logger.config';

import { PrismaModule } from './prisma/prisma.module';
import { StorageModule } from './storage/storage.module';
import { ObservabilityModule } from './observability/observability.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { DocumentsModule } from './documents/documents.module';
import { OcrModule } from './ocr/ocr.module';
import { ExtractionModule } from './extraction/extraction.module';
import { ValidationModule } from './validation/validation.module';
import { EtlModule } from './etl/etl.module';
import { PipelinesModule } from './pipelines/pipelines.module';
import { WorkflowsModule } from './workflows/workflows.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { AuditModule } from './audit/audit.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validationSchema: envValidationSchema,
      validationOptions: { abortEarly: false },
    }),
    LoggerModule.forRoot(pinoConfig()),
    ThrottlerModule.forRootAsync({
      useFactory: () => [
        {
          ttl: Number(process.env.RATE_LIMIT_TTL ?? 60) * 1000,
          limit: Number(process.env.RATE_LIMIT_MAX ?? 100),
        },
      ],
    }),

    PrismaModule,
    StorageModule,
    ObservabilityModule,
    HealthModule,

    AuthModule,
    UsersModule,
    OrganizationsModule,
    WorkspacesModule,

    DocumentsModule,
    OcrModule,
    ExtractionModule,
    ValidationModule,

    EtlModule,
    PipelinesModule,
    WorkflowsModule,
    IntegrationsModule,

    MonitoringModule,
    AuditModule,
  ],
  providers: [
    AppConfig,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
  exports: [AppConfig],
})
export class AppModule {}

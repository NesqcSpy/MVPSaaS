import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { AppConfig } from '../config/configuration';
import { bullConnection } from './bullmq.config';
import { QUEUE } from './queue.constants';
import { WorkflowEngineService } from './workflow-engine.service';
import { WorkflowsController } from './workflows.controller';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [AppConfig],
      useFactory: (cfg: AppConfig) => ({
        connection: bullConnection(cfg.redisUrl),
      }),
    }),
    BullModule.registerQueue(
      { name: QUEUE.OCR },
      { name: QUEUE.EXTRACTION },
      { name: QUEUE.VALIDATION },
      { name: QUEUE.ETL_EXPORT },
      { name: QUEUE.WORKFLOW },
    ),
  ],
  controllers: [WorkflowsController],
  providers: [WorkflowEngineService, AppConfig],
  exports: [BullModule, WorkflowEngineService],
})
export class WorkflowsModule {}

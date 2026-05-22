import { Module } from '@nestjs/common';

import { EtlService } from './etl.service';
import { EtlController } from './etl.controller';
import { EtlProcessor } from './etl.processor';

import { ConnectorFactory } from './connectors/connector.factory';
import { CredentialsCryptoService } from './security/credentials.service';

import { TransformationPipeline } from './transformations/transformation.pipeline';
import { UnionAllTransformation } from './transformations/union-all.transformation';
import { FieldMappingTransformation } from './transformations/field-mapping.transformation';

import { WorkspacesModule } from '../workspaces/workspaces.module';
import { AppConfig } from '../config/configuration';

@Module({
  imports: [WorkspacesModule],
  controllers: [EtlController],
  providers: [
    AppConfig,
    EtlService,
    EtlProcessor,
    ConnectorFactory,
    CredentialsCryptoService,

    TransformationPipeline,
    UnionAllTransformation,
    FieldMappingTransformation,
  ],
  exports: [EtlService, TransformationPipeline, ConnectorFactory, CredentialsCryptoService],
})
export class EtlModule {}

import { Module } from '@nestjs/common';

import { IntegrationsService } from './integrations.service';
import { IntegrationsController } from './integrations.controller';
import { CredentialsCryptoService } from '../etl/security/credentials.service';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { AppConfig } from '../config/configuration';

@Module({
  imports: [WorkspacesModule],
  controllers: [IntegrationsController],
  providers: [AppConfig, IntegrationsService, CredentialsCryptoService],
  exports: [IntegrationsService],
})
export class IntegrationsModule {}

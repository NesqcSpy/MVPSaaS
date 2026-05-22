import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { MonitoringService } from './monitoring.service';

@ApiBearerAuth()
@ApiTags('monitoring')
@Controller({ path: 'monitoring', version: '1' })
export class MonitoringController {
  constructor(
    private readonly monitoring: MonitoringService,
    private readonly workspaces: WorkspacesService,
  ) {}

  @Get('overview')
  async overview(@CurrentUser() user: AuthUser) {
    const ws = await this.workspaces.firstForUser(user.id);
    return this.monitoring.overview(ws.id);
  }

  @Get('failures')
  async failures(@CurrentUser() user: AuthUser) {
    const ws = await this.workspaces.firstForUser(user.id);
    return this.monitoring.recentFailures(ws.id);
  }

  @Get('throughput')
  async throughput(
    @Query('hours') hours: string | undefined,
    @CurrentUser() user: AuthUser,
  ) {
    const ws = await this.workspaces.firstForUser(user.id);
    return this.monitoring.throughput(ws.id, Math.min(168, Math.max(1, Number(hours ?? 24))));
  }

  @Get('documents/recent')
  async recent(@CurrentUser() user: AuthUser) {
    const ws = await this.workspaces.firstForUser(user.id);
    return this.monitoring.recentDocuments(ws.id);
  }
}

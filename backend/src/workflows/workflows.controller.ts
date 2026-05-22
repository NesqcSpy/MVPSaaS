import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JobStatus } from '@prisma/client';

import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';
import { WorkflowEngineService } from './workflow-engine.service';
import { WorkspacesService } from '../workspaces/workspaces.service';

@ApiBearerAuth()
@ApiTags('workflows')
@Controller({ path: 'workflows', version: '1' })
export class WorkflowsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly engine: WorkflowEngineService,
    private readonly workspaces: WorkspacesService,
  ) {}

  @Get('jobs')
  async jobs(
    @Query() pagination: PaginationDto,
    @Query('status') status: JobStatus | undefined,
    @CurrentUser() user: AuthUser,
  ) {
    const ws = await this.workspaces.firstForUser(user.id);
    const where = { workspaceId: ws.id, ...(status ? { status } : {}) };

    const [items, total] = await Promise.all([
      this.prisma.workflowJob.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: pagination.limit,
        skip: pagination.offset,
      }),
      this.prisma.workflowJob.count({ where }),
    ]);
    return { items, total, limit: pagination.limit, offset: pagination.offset };
  }

  @Get('queues/health')
  queueHealth() {
    return this.engine.queueHealth();
  }
}

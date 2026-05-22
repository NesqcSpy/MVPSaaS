import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { AuditService } from './audit.service';
import { WorkspacesService } from '../workspaces/workspaces.service';

@ApiBearerAuth()
@ApiTags('audit')
@Controller({ path: 'audit', version: '1' })
export class AuditController {
  constructor(private readonly audit: AuditService, private readonly workspaces: WorkspacesService) {}

  @Get()
  async list(
    @Query() pagination: PaginationDto,
    @Query('action') action: string | undefined,
    @CurrentUser() user: AuthUser,
  ) {
    const ws = await this.workspaces.firstForUser(user.id);
    const [items, total] = await this.audit.list(ws.id, { ...pagination, action });
    return { items, total, limit: pagination.limit, offset: pagination.offset };
  }
}

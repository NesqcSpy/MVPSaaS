import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';
import { WorkspacesService } from './workspaces.service';

@ApiBearerAuth()
@ApiTags('workspaces')
@Controller({ path: 'workspaces', version: '1' })
export class WorkspacesController {
  constructor(private readonly workspaces: WorkspacesService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    if (!user.organizationId) return [];
    return this.workspaces.listForOrg(user.organizationId);
  }

  @Get('default')
  default(@CurrentUser() user: AuthUser) {
    return this.workspaces.firstForUser(user.id);
  }

  @Get(':id')
  get(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.workspaces.assertAccess(id, user.id);
  }
}

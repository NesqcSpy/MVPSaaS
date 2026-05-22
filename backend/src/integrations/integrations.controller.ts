import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { IntegrationsService } from './integrations.service';
import {
  CreateIntegrationDto,
  UpdateIntegrationDto,
} from './dto/integration.dto';

@ApiBearerAuth()
@ApiTags('integrations')
@Controller({ path: 'integrations', version: '1' })
export class IntegrationsController {
  constructor(
    private readonly integrations: IntegrationsService,
    private readonly workspaces: WorkspacesService,
  ) {}

  @Get()
  async list(@CurrentUser() user: AuthUser) {
    const ws = await this.workspaces.firstForUser(user.id);
    return this.integrations.list(ws.id);
  }

  @Get(':id')
  async get(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    const ws = await this.workspaces.firstForUser(user.id);
    return this.integrations.get(ws.id, id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateIntegrationDto, @CurrentUser() user: AuthUser) {
    const ws = await this.workspaces.firstForUser(user.id);
    return this.integrations.create(ws.id, dto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateIntegrationDto,
    @CurrentUser() user: AuthUser,
  ) {
    const ws = await this.workspaces.firstForUser(user.id);
    return this.integrations.update(ws.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    const ws = await this.workspaces.firstForUser(user.id);
    await this.integrations.remove(ws.id, id);
  }
}

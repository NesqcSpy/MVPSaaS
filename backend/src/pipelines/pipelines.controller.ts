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
import { PipelinesService } from './pipelines.service';
import { CreatePipelineDto, UpdatePipelineDto } from './dto/pipeline.dto';

@ApiBearerAuth()
@ApiTags('pipelines')
@Controller({ path: 'pipelines', version: '1' })
export class PipelinesController {
  constructor(
    private readonly pipelines: PipelinesService,
    private readonly workspaces: WorkspacesService,
  ) {}

  @Get()
  async list(@CurrentUser() user: AuthUser) {
    const ws = await this.workspaces.firstForUser(user.id);
    return this.pipelines.list(ws.id);
  }

  @Get(':id')
  async get(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    const ws = await this.workspaces.firstForUser(user.id);
    return this.pipelines.get(ws.id, id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreatePipelineDto, @CurrentUser() user: AuthUser) {
    const ws = await this.workspaces.firstForUser(user.id);
    return this.pipelines.create(ws.id, dto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePipelineDto,
    @CurrentUser() user: AuthUser,
  ) {
    const ws = await this.workspaces.firstForUser(user.id);
    return this.pipelines.update(ws.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    const ws = await this.workspaces.firstForUser(user.id);
    await this.pipelines.remove(ws.id, id);
  }
}

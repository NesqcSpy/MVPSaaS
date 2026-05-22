import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { randomUUID } from 'crypto';

import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { WorkflowEngineService } from '../workflows/workflow-engine.service';
import { QUEUE } from '../workflows/queue.constants';
import { EtlService } from './etl.service';
import { TransformationPipeline } from './transformations/transformation.pipeline';
import { UnionAllTransformation } from './transformations/union-all.transformation';
import { RunExportDto } from './dto/export.dto';

@ApiBearerAuth()
@ApiTags('etl')
@Controller({ path: 'etl', version: '1' })
export class EtlController {
  constructor(
    private readonly workspaces: WorkspacesService,
    private readonly engine: WorkflowEngineService,
    private readonly etl: EtlService,
    private readonly transformations: TransformationPipeline,
  ) {}

  /** Synchronous one-shot run — handy for "Run now" buttons. */
  @Post('run')
  @HttpCode(HttpStatus.OK)
  async runNow(@Body() dto: RunExportDto) {
    return this.etl.runPipeline(dto.pipelineId, { documentIds: dto.documentIds });
  }

  /** Asynchronous enqueue — preferred for production triggers. */
  @Post('enqueue')
  @HttpCode(HttpStatus.ACCEPTED)
  async enqueue(@Body() dto: RunExportDto, @CurrentUser() user: AuthUser) {
    const ws = await this.workspaces.firstForUser(user.id);
    const correlationId = randomUUID();
    const ids = dto.documentIds && dto.documentIds.length > 0 ? dto.documentIds : [null];

    const jobIds: string[] = [];
    for (const documentId of ids) {
      const jobId = await this.engine.enqueue(
        QUEUE.ETL_EXPORT,
        'export',
        { documentId, pipelineId: dto.pipelineId },
        {
          workspaceId: ws.id,
          documentId: documentId ?? undefined,
          pipelineId: dto.pipelineId,
          correlationId,
        },
      );
      jobIds.push(jobId);
    }
    return { ok: true, jobIds, correlationId };
  }

  @Post('integrations/:id/test')
  @HttpCode(HttpStatus.OK)
  async testIntegration(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    const ws = await this.workspaces.firstForUser(user.id);
    return this.etl.testIntegration(id, ws.id);
  }

  @Get('transformations')
  list() {
    return this.transformations.list();
  }

  /**
   * Materialize the UNION ALL view directly in a Postgres warehouse.
   * Returns the SQL statement; the operator decides whether to run it.
   */
  @Get('transformations/union-all/sql')
  unionSql(
    @Query('schema') schema: string | undefined,
    @Query('view') view: string | undefined,
    @CurrentUser() user: AuthUser,
  ) {
    return this.workspaces.firstForUser(user.id).then((ws) => ({
      sql: UnionAllTransformation.toSql({
        schema,
        viewName: view,
        workspaceId: ws.id,
      }),
    }));
  }
}

import { Controller, NotFoundException, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { randomUUID } from 'crypto';

import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { WorkflowEngineService } from '../workflows/workflow-engine.service';
import { QUEUE } from '../workflows/queue.constants';
import { PrismaService } from '../prisma/prisma.service';

@ApiBearerAuth()
@ApiTags('extraction')
@Controller({ path: 'extraction', version: '1' })
export class ExtractionController {
  constructor(
    private readonly workspaces: WorkspacesService,
    private readonly engine: WorkflowEngineService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('documents/:id/reprocess')
  async reprocess(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    const ws = await this.workspaces.firstForUser(user.id);
    const doc = await this.prisma.document.findFirst({
      where: { id, workspaceId: ws.id, deletedAt: null },
      select: { id: true },
    });
    if (!doc) throw new NotFoundException('Document not found');

    const correlationId = randomUUID();
    const jobId = await this.engine.enqueue(
      QUEUE.EXTRACTION,
      'extract',
      { documentId: doc.id },
      { workspaceId: ws.id, documentId: doc.id, correlationId },
    );
    return { ok: true, jobId, correlationId };
  }
}

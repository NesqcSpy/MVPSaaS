import { Controller, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { WorkflowEngineService } from '../workflows/workflow-engine.service';
import { QUEUE } from '../workflows/queue.constants';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';
import { NotFoundException } from '@nestjs/common';

@ApiBearerAuth()
@ApiTags('ocr')
@Controller({ path: 'ocr', version: '1' })
export class OcrController {
  constructor(
    private readonly workspaces: WorkspacesService,
    private readonly engine: WorkflowEngineService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Re-queue OCR for an existing document. Useful when a provider change
   * or an upstream fix means an old document should be reprocessed.
   */
  @Post('documents/:id/reprocess')
  async reprocess(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    const ws = await this.workspaces.firstForUser(user.id);
    const doc = await this.prisma.document.findFirst({
      where: { id, workspaceId: ws.id, deletedAt: null },
      select: { id: true, storageKey: true, mimeType: true },
    });
    if (!doc) throw new NotFoundException('Document not found');

    const correlationId = randomUUID();
    const jobId = await this.engine.enqueue(
      QUEUE.OCR,
      'process',
      { documentId: doc.id, storageKey: doc.storageKey, mimeType: doc.mimeType },
      { workspaceId: ws.id, documentId: doc.id, correlationId },
    );
    return { ok: true, jobId, correlationId };
  }
}

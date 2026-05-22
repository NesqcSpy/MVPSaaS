import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DocumentKind, DocumentStatus } from '@prisma/client';
import { createHash, randomUUID } from 'crypto';

import { DocumentsRepository } from './documents.repository';
import { STORAGE_SERVICE, StorageService } from '../storage/storage.tokens';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { WorkflowEngineService } from '../workflows/workflow-engine.service';
import { QUEUE } from '../workflows/queue.constants';
import { AuditService } from '../audit/audit.service';

const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
]);
const MAX_SIZE_BYTES = 50 * 1024 * 1024;

@Injectable()
export class DocumentsService {
  constructor(
    private readonly repo: DocumentsRepository,
    private readonly workspaces: WorkspacesService,
    private readonly engine: WorkflowEngineService,
    private readonly audit: AuditService,
    @Inject(STORAGE_SERVICE) private readonly storage: StorageService,
  ) {}

  async upload(
    userId: string,
    file: Express.Multer.File,
    kind: DocumentKind = DocumentKind.GENERIC,
  ) {
    if (!file) throw new BadRequestException('No file provided');
    if (!ALLOWED_MIME.has(file.mimetype)) {
      throw new BadRequestException(`Unsupported mime type: ${file.mimetype}`);
    }
    if (file.size > MAX_SIZE_BYTES) {
      throw new BadRequestException(`File too large (max ${MAX_SIZE_BYTES} bytes)`);
    }

    const ws = await this.workspaces.firstForUser(userId);
    const checksum = createHash('sha256').update(file.buffer).digest('hex');
    const storageKey = `workspaces/${ws.id}/documents/${randomUUID()}-${this.safeName(file.originalname)}`;

    await this.storage.put(storageKey, file.buffer, file.mimetype);

    const doc = await this.repo.create({
      workspaceId: ws.id,
      uploaderId: userId,
      filename: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      storageKey,
      checksum,
      kind,
      status: DocumentStatus.UPLOADED,
    });

    const correlationId = randomUUID();
    await this.engine.enqueue(
      QUEUE.OCR,
      'process',
      { documentId: doc.id, storageKey, mimeType: file.mimetype },
      { workspaceId: ws.id, documentId: doc.id, correlationId },
    );

    await this.audit.record({
      userId,
      workspaceId: ws.id,
      action: 'document.upload',
      resourceType: 'document',
      resourceId: doc.id,
      metadata: { filename: doc.filename, sizeBytes: doc.sizeBytes },
    });

    return doc;
  }

  async list(userId: string, query: {
    limit: number; offset: number; status?: DocumentStatus; search?: string;
  }) {
    const ws = await this.workspaces.firstForUser(userId);
    const [items, total] = await this.repo.list(ws.id, query);
    return { items, total, limit: query.limit, offset: query.offset };
  }

  async get(userId: string, id: string) {
    const ws = await this.workspaces.firstForUser(userId);
    const doc = await this.repo.findById(id, ws.id);
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async remove(userId: string, id: string) {
    const doc = await this.get(userId, id);
    await this.repo.softDelete(doc.id);
    return { ok: true };
  }

  private safeName(name: string): string {
    return name.replace(/[^a-zA-Z0-9_.-]+/g, '_').slice(0, 120);
  }
}

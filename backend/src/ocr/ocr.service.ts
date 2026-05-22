import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { DocumentStatus } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { STORAGE_SERVICE, StorageService } from '../storage/storage.tokens';
import { OCRProviderFactory } from './providers/ocr-provider.factory';
import { OCRResult } from './providers/ocr-provider.interface';
import { DocumentsRepository } from '../documents/documents.repository';
import { MetricsService } from '../observability/metrics.service';

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly factory: OCRProviderFactory,
    private readonly documents: DocumentsRepository,
    private readonly metrics: MetricsService,
    @Inject(STORAGE_SERVICE) private readonly storage: StorageService,
  ) {}

  /**
   * Run OCR on a previously uploaded document. Idempotent: re-runs replace
   * the prior OCRResult atomically and re-advance the document's status.
   */
  async runForDocument(documentId: string): Promise<OCRResult> {
    const doc = await this.prisma.document.findUnique({ where: { id: documentId } });
    if (!doc) throw new NotFoundException(`Document ${documentId} not found`);

    await this.documents.updateStatus(doc.id, DocumentStatus.OCR_RUNNING, null);

    const provider = this.factory.getActive();
    const file = await this.storage.get(doc.storageKey);

    const start = Date.now();
    let result: OCRResult;
    try {
      result = await provider.extract(file, {
        mimeType: doc.mimeType,
        filename: doc.filename,
      });
    } catch (err) {
      const message = (err as Error).message ?? 'OCR failed';
      this.logger.error(
        { documentId: doc.id, provider: provider.name, err: message },
        'OCR provider error',
      );
      await this.documents.updateStatus(doc.id, DocumentStatus.FAILED, `OCR: ${message}`);
      throw err;
    }

    this.metrics.ocrLatency.observe({ provider: provider.name }, (Date.now() - start) / 1000);

    await this.persist(doc.id, result);

    await this.prisma.document.update({
      where: { id: doc.id },
      data: {
        status: DocumentStatus.OCR_COMPLETE,
        pageCount: result.pages.length,
        error: null,
      },
    });

    this.logger.log(
      `OCR complete: doc=${doc.id} provider=${provider.name} pages=${result.pages.length} ms=${result.durationMs}`,
    );

    return result;
  }

  private async persist(documentId: string, result: OCRResult): Promise<void> {
    await this.prisma.oCRResult.upsert({
      where: { documentId },
      create: {
        documentId,
        provider: result.provider,
        rawText: result.rawText,
        pages: result.pages as unknown as object,
        confidence: result.confidence,
        durationMs: result.durationMs,
      },
      update: {
        provider: result.provider,
        rawText: result.rawText,
        pages: result.pages as unknown as object,
        confidence: result.confidence,
        durationMs: result.durationMs,
      },
    });
  }
}

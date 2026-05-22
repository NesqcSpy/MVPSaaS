import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DocumentStatus } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { DocumentsRepository } from '../documents/documents.repository';
import { TemplateRegistry } from './templates/template.registry';
import { TemplateExtraction } from './templates/template.interface';

@Injectable()
export class ExtractionService {
  private readonly logger = new Logger(ExtractionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly documents: DocumentsRepository,
    private readonly registry: TemplateRegistry,
  ) {}

  /**
   * Reads the persisted OCR text, picks the best template for the
   * document's kind, persists the result, and advances the document's
   * status to EXTRACTED. Idempotent — re-runs replace the prior result.
   */
  async runForDocument(documentId: string): Promise<TemplateExtraction> {
    const doc = await this.prisma.document.findUnique({
      where: { id: documentId },
      include: { ocrResult: true },
    });
    if (!doc) throw new NotFoundException(`Document ${documentId} not found`);
    if (!doc.ocrResult) throw new NotFoundException(`OCR result missing for document ${documentId}`);

    await this.documents.updateStatus(doc.id, DocumentStatus.EXTRACTING, null);
    const start = Date.now();

    let extraction: TemplateExtraction;
    try {
      extraction = this.registry.select(doc.kind, doc.ocrResult.rawText).extraction;
    } catch (err) {
      const msg = (err as Error).message ?? 'Extraction failed';
      await this.documents.updateStatus(doc.id, DocumentStatus.FAILED, `EXTRACTION: ${msg}`);
      throw err;
    }

    const durationMs = Date.now() - start;
    const fieldScores = Object.fromEntries(
      Object.entries(extraction.fields).map(([k, v]) => [k, v.confidence]),
    );

    await this.prisma.extractionResult.upsert({
      where: { documentId: doc.id },
      create: {
        documentId: doc.id,
        template: extraction.template,
        data: extraction.data as unknown as object,
        fieldScores,
        overallScore: extraction.overallScore,
        durationMs,
      },
      update: {
        template: extraction.template,
        data: extraction.data as unknown as object,
        fieldScores,
        overallScore: extraction.overallScore,
        durationMs,
      },
    });

    await this.documents.updateStatus(doc.id, DocumentStatus.EXTRACTED, null);
    this.logger.log(
      `Extraction complete: doc=${doc.id} template=${extraction.template} score=${extraction.overallScore.toFixed(2)} ms=${durationMs}`,
    );
    return extraction;
  }
}

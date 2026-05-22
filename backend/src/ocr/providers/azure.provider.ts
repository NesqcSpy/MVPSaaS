import { Injectable } from '@nestjs/common';
import { OCROptions, OCRProvider, OCRResult } from './ocr-provider.interface';

/**
 * Azure AI Document Intelligence (formerly Form Recognizer) — registry
 * placeholder. Activate by installing @azure/ai-form-recognizer and
 * replacing the methods below with DocumentAnalysisClient.beginAnalyzeDocument.
 */
@Injectable()
export class AzureOcrProvider implements OCRProvider {
  readonly name = 'azure';

  ensureReady(): void {
    throw new Error(
      'Azure Document Intelligence provider not yet implemented — install @azure/ai-form-recognizer and complete AzureOcrProvider.',
    );
  }

  async extract(_file: Buffer, _opts: OCROptions): Promise<OCRResult> {
    throw new Error('Azure provider not yet implemented');
  }
}

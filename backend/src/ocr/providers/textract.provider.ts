import { Injectable } from '@nestjs/common';
import { OCROptions, OCRProvider, OCRResult } from './ocr-provider.interface';

/**
 * AWS Textract — placeholder slot in the registry. The factory will only
 * resolve this if OCR_PROVIDER=textract; in that case ensureReady() must
 * throw until the AWS SDK is wired in, so deployments can't silently fall
 * back to a degraded provider.
 *
 * To activate:
 *   1. pnpm add @aws-sdk/client-textract
 *   2. Replace ensureReady/extract with TextractClient.send(AnalyzeDocumentCommand)
 *   3. Map Blocks[] → OCRPage[] preserving page geometry.
 */
@Injectable()
export class TextractOcrProvider implements OCRProvider {
  readonly name = 'textract';

  ensureReady(): void {
    throw new Error(
      'Textract provider not yet implemented — install @aws-sdk/client-textract and complete TextractOcrProvider.',
    );
  }

  async extract(_file: Buffer, _opts: OCROptions): Promise<OCRResult> {
    throw new Error('Textract provider not yet implemented');
  }
}

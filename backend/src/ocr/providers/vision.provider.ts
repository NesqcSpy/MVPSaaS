import { Injectable } from '@nestjs/common';
import { OCROptions, OCRProvider, OCRResult } from './ocr-provider.interface';

/**
 * Google Cloud Vision (DOCUMENT_TEXT_DETECTION) — registry placeholder.
 * Activate by installing @google-cloud/vision and replacing the methods
 * below with a call to ImageAnnotatorClient.batchAnnotateFiles.
 */
@Injectable()
export class VisionOcrProvider implements OCRProvider {
  readonly name = 'vision';

  ensureReady(): void {
    throw new Error(
      'Google Vision provider not yet implemented — install @google-cloud/vision and complete VisionOcrProvider.',
    );
  }

  async extract(_file: Buffer, _opts: OCROptions): Promise<OCRResult> {
    throw new Error('Google Vision provider not yet implemented');
  }
}

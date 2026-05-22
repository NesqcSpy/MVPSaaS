import { Injectable } from '@nestjs/common';
import { OCROptions, OCRProvider, OCRResult } from './ocr-provider.interface';

/**
 * Deterministic OCR provider for tests + local dev when no API key is
 * configured. Returns a synthetic invoice-shaped text so the rest of the
 * pipeline (extraction → validation → ETL) can be exercised end to end.
 */
@Injectable()
export class MockOcrProvider implements OCRProvider {
  readonly name = 'mock';

  ensureReady(): void {
    // always ready
  }

  async extract(file: Buffer, opts: OCROptions): Promise<OCRResult> {
    const start = Date.now();
    const sample = [
      'ACME Corp',
      '123 Industrial Pkwy, Monterrey, NL',
      '',
      'INVOICE',
      'Invoice #: INV-2026-002',
      'Date: 2026-05-21',
      'Bill To: Globex Industries',
      '',
      'Description                  Qty   Unit       Total',
      'Operational data automation   1    15000.00   15000.00',
      '',
      'Subtotal: 15000.00',
      'Tax (16%): 2400.00',
      'Total: 17400.00 MXN',
      '',
      `Source: ${opts.filename ?? 'unknown'} (${file.length} bytes)`,
    ].join('\n');

    return {
      provider: this.name,
      rawText: sample,
      pages: [{ index: 1, text: sample, markdown: sample, confidence: 0.99 }],
      confidence: 0.99,
      durationMs: Date.now() - start,
      meta: { synthetic: true },
    };
  }
}

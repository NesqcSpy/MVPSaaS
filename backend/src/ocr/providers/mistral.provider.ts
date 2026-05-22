import { Injectable, Logger } from '@nestjs/common';

import { AppConfig } from '../../config/configuration';
import { OCROptions, OCRPage, OCRProvider, OCRResult } from './ocr-provider.interface';

/**
 * Mistral OCR (https://docs.mistral.ai/capabilities/document/).
 *
 * Sends the document as a base64 data URL — works for both PDFs and images.
 * Returns pages with markdown; we coerce markdown into plain text for the
 * `rawText` field while preserving the original markdown per page.
 */

interface MistralOcrPageResponse {
  index: number;
  markdown?: string;
  text?: string;
  dimensions?: { dpi?: number; height?: number; width?: number };
}

interface MistralOcrResponse {
  pages: MistralOcrPageResponse[];
  model?: string;
  usage_info?: Record<string, unknown>;
  document_annotation?: Record<string, unknown>;
}

@Injectable()
export class MistralOcrProvider implements OCRProvider {
  readonly name = 'mistral';
  private readonly logger = new Logger(MistralOcrProvider.name);

  private readonly endpoint: string;
  private readonly apiKey: string;
  private readonly model = 'mistral-ocr-latest';

  constructor(cfg: AppConfig) {
    this.endpoint = `${cfg.ocr.mistralUrl.replace(/\/+$/, '')}/ocr`;
    this.apiKey = cfg.ocr.mistralKey;
  }

  ensureReady(): void {
    if (!this.apiKey) {
      throw new Error(
        'MISTRAL_API_KEY is not set — cannot use Mistral OCR provider. ' +
          'Either set the key or change OCR_PROVIDER to "mock".',
      );
    }
  }

  async extract(file: Buffer, opts: OCROptions): Promise<OCRResult> {
    const start = Date.now();
    const documentField = this.buildDocumentField(file, opts.mimeType);

    const body = {
      model: this.model,
      document: documentField,
      include_image_base64: false,
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
    };
    if (opts.correlationId) headers['X-Correlation-Id'] = opts.correlationId;

    const res = await fetch(this.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await this.safeReadError(res);
      throw new Error(`Mistral OCR ${res.status}: ${errText}`);
    }

    const json = (await res.json()) as MistralOcrResponse;
    const pages = this.normalizePages(json.pages ?? []);
    const rawText = pages.map((p) => p.text).join('\f');

    const durationMs = Date.now() - start;
    this.logger.debug(
      `Mistral OCR ok: pages=${pages.length} bytes=${file.length} ms=${durationMs}`,
    );

    return {
      provider: this.name,
      pages,
      rawText,
      durationMs,
      meta: {
        model: json.model ?? this.model,
        usage: json.usage_info,
      },
    };
  }

  private buildDocumentField(file: Buffer, mime: string) {
    const base64 = file.toString('base64');
    if (mime === 'application/pdf') {
      return {
        type: 'document_url' as const,
        document_url: `data:${mime};base64,${base64}`,
      };
    }
    // images
    return {
      type: 'image_url' as const,
      image_url: `data:${mime};base64,${base64}`,
    };
  }

  private normalizePages(pages: MistralOcrPageResponse[]): OCRPage[] {
    if (pages.length === 0) {
      return [{ index: 1, text: '', markdown: '' }];
    }
    return pages
      .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
      .map((p, i) => {
        const markdown = (p.markdown ?? '').trim();
        const text = (p.text ?? this.markdownToText(markdown)).trim();
        return {
          index: typeof p.index === 'number' ? p.index + 1 : i + 1,
          text,
          markdown,
          width: p.dimensions?.width,
          height: p.dimensions?.height,
        };
      });
  }

  /**
   * Conservative markdown → text: strip common syntax but preserve line
   * structure (which matters for downstream regex-based extraction).
   */
  private markdownToText(md: string): string {
    return md
      // images / links
      .replace(/!\[[^\]]*]\([^)]*\)/g, '')
      .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
      // headings
      .replace(/^#{1,6}\s+/gm, '')
      // emphasis
      .replace(/(\*\*|__)(.*?)\1/g, '$2')
      .replace(/(\*|_)(.*?)\1/g, '$2')
      // inline code / code fences
      .replace(/`{1,3}([^`]*)`{1,3}/g, '$1')
      // table separators
      .replace(/^\s*\|?\s*[:\- ]+[: \-|]*$/gm, '');
  }

  private async safeReadError(res: Response): Promise<string> {
    try {
      const t = await res.text();
      return t.slice(0, 500);
    } catch {
      return res.statusText;
    }
  }
}

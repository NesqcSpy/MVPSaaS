/**
 * OCR provider contract.
 *
 * Implementations are registered with OCRProviderFactory and selected at
 * runtime via OCR_PROVIDER env. The contract is intentionally minimal —
 * everything downstream (extraction, validation) consumes OCRResult, not
 * provider-specific responses.
 */

export interface OCROptions {
  /** Mime type of the source buffer (e.g. "application/pdf"). */
  mimeType: string;
  /** Original filename, useful for providers that key on extension. */
  filename?: string;
  /** Per-request language hint (ISO 639-1). Optional; provider may ignore. */
  language?: string;
  /** Optional correlation id to propagate to the provider for tracing. */
  correlationId?: string;
}

export interface OCRPage {
  /** 1-indexed page number. */
  index: number;
  /** Plain-text content of the page. */
  text: string;
  /** Markdown rendering when the provider supports it. */
  markdown?: string;
  /** Page-level confidence in [0, 1]. */
  confidence?: number;
  /** Page width/height in pixels (provider-dependent). */
  width?: number;
  height?: number;
  /**
   * Optional block-level breakdown. Shape is intentionally loose — providers
   * disagree on what a "block" is (paragraph, line, table, etc.). Consumers
   * that care about geometry should narrow this themselves.
   */
  blocks?: Array<{
    type: 'line' | 'paragraph' | 'table' | 'figure' | string;
    text?: string;
    bbox?: [number, number, number, number]; // [x, y, w, h]
    confidence?: number;
  }>;
}

export interface OCRResult {
  /** Provider name (e.g. "mistral"). */
  provider: string;
  /** Concatenation of every page's text, separated by form feed. */
  rawText: string;
  /** Per-page content. Always at least one entry. */
  pages: OCRPage[];
  /** Overall confidence in [0, 1] when the provider supplies it. */
  confidence?: number;
  /** Wall-clock duration of the provider call. */
  durationMs: number;
  /** Free-form provider diagnostics — model name, request id, token usage… */
  meta?: Record<string, unknown>;
}

export interface OCRProvider {
  /** Stable identifier used by the factory and recorded on results. */
  readonly name: string;
  /** Throws if the provider can't be used (missing key, bad config, …). */
  ensureReady(): Promise<void> | void;
  /** Run OCR on a single document buffer. */
  extract(file: Buffer, opts: OCROptions): Promise<OCRResult>;
}

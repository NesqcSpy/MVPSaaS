import { DocumentKind } from '@prisma/client';

/**
 * Extracted field with a confidence score and the literal source span it
 * was lifted from. Confidence is in [0, 1] — never negative, never > 1.
 */
export interface ExtractedField<T = unknown> {
  value: T | null;
  confidence: number;
  source?: string;
}

/**
 * Result of running a template against OCR text. `data` is the cleaned,
 * caller-friendly object (the dictionary that flows downstream); `fields`
 * is the rich record with per-field confidence + source. Both views are
 * persisted — the dictionary in `data`, the scores in `fieldScores`.
 */
export interface TemplateExtraction {
  template: string;
  data: Record<string, unknown>;
  fields: Record<string, ExtractedField>;
  overallScore: number;
}

/**
 * Extraction templates pull structured fields out of OCR text.
 *
 * A template is owned by exactly one `DocumentKind`. The registry chooses
 * the template by `kind` first; the generic template is the fallback.
 */
export interface ExtractionTemplate {
  readonly name: string;
  readonly kind: DocumentKind;
  /** Required fields are part of the overall-score denominator. */
  readonly requiredFields: readonly string[];
  /** Optional fields contribute to the score but don't penalize when missing. */
  readonly optionalFields: readonly string[];

  extract(rawText: string): TemplateExtraction;
}

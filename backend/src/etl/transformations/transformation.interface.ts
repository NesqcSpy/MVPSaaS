import { EtlBatch, EtlRow } from '../connectors/connector.interface';

/**
 * Materialized extraction input — one per document — that flows into the
 * transformation pipeline. The shape mirrors ExtractionResult plus the
 * minimum document metadata downstream stages need.
 */
export interface ExtractionRecord {
  documentId: string;
  workspaceId: string;
  template: string;
  filename: string;
  data: Record<string, unknown>;
  fieldScores: Record<string, number>;
  overallScore: number | null;
  createdAt: Date;
}

export interface TransformationContext {
  workspaceId: string;
  /** Pipeline-level field mapping if the operator configured one. */
  fieldMappings?: Record<string, string>; // sourceField → destField
  /** Pipeline destination name (table / file / endpoint root). */
  destination: string;
}

export interface Transformation {
  readonly id: string;
  apply(records: ExtractionRecord[], ctx: TransformationContext): EtlBatch | Promise<EtlBatch>;
}

/**
 * Canonical unified row schema. Every UNION ALL output row conforms to
 * this superset; missing values become null. Connectors can pick a
 * subset via `columns`, but the unified schema stays the same.
 */
export const UNIFIED_COLUMNS = [
  '_source_kind',
  '_source_document_id',
  '_source_filename',
  '_source_score',
  '_source_created_at',
  'reference',     // invoice_number / po_number / receipt_number — whichever the template has
  'counterparty',  // customer/vendor/supplier/buyer/merchant
  'date',
  'due_date',
  'expected_delivery',
  'subtotal',
  'tax',
  'total_amount',
  'currency',
  'payment_method',
  'raw_data',      // JSON-string copy of the original record.data
] as const;

export type UnifiedRow = Record<(typeof UNIFIED_COLUMNS)[number], EtlRow[string]>;

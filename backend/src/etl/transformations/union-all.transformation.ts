import { Injectable } from '@nestjs/common';

import { EtlBatch, EtlRow } from '../connectors/connector.interface';
import {
  ExtractionRecord,
  Transformation,
  TransformationContext,
  UNIFIED_COLUMNS,
  UnifiedRow,
} from './transformation.interface';

/**
 * UnionAllTransformation
 * ----------------------
 *
 * Combines extraction records produced by *any* template (invoice,
 * receipt, purchase_order, generic) into a single, flat stream of rows
 * that share one unified schema. Semantically this is a SQL UNION ALL
 * across the per-template projections — except instead of emitting raw
 * `extraction_results.data` blobs, every template is first mapped onto
 * the canonical column set (see UNIFIED_COLUMNS).
 *
 * Why a union and not a join?
 *   - Invoices, receipts, and POs share the same business shape
 *     (counterparty + reference + amount + date) but live under
 *     different field names. A union over normalized projections gives
 *     downstream BI tools / databases a single, stable table to query.
 *   - UNION ALL (not UNION) is intentional: duplicates may be legitimate
 *     (the same invoice number on two scans is still two rows of work),
 *     and dedup decisions belong in validation, not transformation.
 *
 * Output guarantees:
 *   - `columns` is exactly UNIFIED_COLUMNS, in order.
 *   - Every row has every key (null when absent).
 *   - `_source_kind` tags the template the row originated from, so
 *     analytics can split the union back apart.
 */
@Injectable()
export class UnionAllTransformation implements Transformation {
  readonly id = 'union-all';

  apply(records: ExtractionRecord[], ctx: TransformationContext): EtlBatch {
    const rows: EtlRow[] = [];

    for (const r of records) {
      const projected = this.project(r);
      rows.push(applyMappings(projected, ctx.fieldMappings));
    }

    return {
      destination: ctx.destination,
      columns: [...UNIFIED_COLUMNS],
      rows,
      meta: {
        transformation: this.id,
        sourceCount: records.length,
        templates: countByTemplate(records),
      },
    };
  }

  /**
   * Projection table — per-template mapping into the unified schema.
   * Keep these explicit. Each template knows which of its fields plays
   * which canonical role, and we never guess.
   */
  private project(r: ExtractionRecord): UnifiedRow {
    const base: UnifiedRow = {
      _source_kind: r.template,
      _source_document_id: r.documentId,
      _source_filename: r.filename,
      _source_score: r.overallScore,
      _source_created_at: r.createdAt,
      reference: null,
      counterparty: null,
      date: pickString(r.data.date),
      due_date: null,
      expected_delivery: null,
      subtotal: pickNumber(r.data.subtotal),
      tax: pickNumber(r.data.tax),
      total_amount: pickNumber(r.data.total_amount),
      currency: pickString(r.data.currency),
      payment_method: null,
      raw_data: JSON.stringify(r.data ?? {}),
    };

    switch (r.template) {
      case 'invoice':
        base.reference = pickString(r.data.invoice_number);
        base.counterparty =
          pickString(r.data.customer_name) ?? pickString(r.data.vendor_name);
        base.due_date = pickString(r.data.due_date);
        break;
      case 'purchase_order':
        base.reference = pickString(r.data.po_number);
        base.counterparty =
          pickString(r.data.supplier) ?? pickString(r.data.buyer);
        base.expected_delivery = pickString(r.data.expected_delivery);
        break;
      case 'receipt':
        base.reference = pickString(r.data.receipt_number);
        base.counterparty = pickString(r.data.merchant);
        base.payment_method = pickString(r.data.payment_method);
        break;
      case 'generic':
      default:
        // generic carries title in lieu of reference, no counterparty.
        base.reference = pickString((r.data as Record<string, unknown>).title);
        break;
    }

    return base;
  }
}

function pickString(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null;
}
function pickNumber(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

function applyMappings(
  row: UnifiedRow,
  mappings: Record<string, string> | undefined,
): EtlRow {
  if (!mappings || Object.keys(mappings).length === 0) return row as EtlRow;
  const out: EtlRow = { ...(row as EtlRow) };
  for (const [src, dest] of Object.entries(mappings)) {
    if (src === dest) continue;
    if (src in out) {
      out[dest] = out[src];
      delete out[src];
    }
  }
  return out;
}

function countByTemplate(records: ExtractionRecord[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const r of records) out[r.template] = (out[r.template] ?? 0) + 1;
  return out;
}

/**
 * SQL flavor of the same union — emitted by `toSql()` for operators who
 * want to materialize the union directly inside a Postgres warehouse,
 * bypassing the row-by-row Node path. Equivalent semantics, just done
 * by the database.
 *
 * Usage:
 *   const ddl = UnionAllTransformation.toSql({
 *     schema: 'analytics',
 *     extractionTable: 'extraction_results',
 *     documentTable: 'documents',
 *     workspaceId: '…uuid…',
 *   });
 *   await pool.query(ddl);
 */
export namespace UnionAllTransformation {
  export interface SqlOptions {
    schema?: string;            // default "public"
    extractionTable?: string;   // default "extraction_results"
    documentTable?: string;     // default "documents"
    workspaceId: string;
    viewName?: string;          // default "unified_extractions"
  }

  export function toSql(opts: SqlOptions): string {
    const schema = ident(opts.schema ?? 'public');
    const ex = ident(opts.extractionTable ?? 'extraction_results');
    const doc = ident(opts.documentTable ?? 'documents');
    const view = ident(opts.viewName ?? 'unified_extractions');
    const ws = sqlString(opts.workspaceId);

    // One SELECT per template projecting into the unified column set,
    // joined to documents for workspace/filename/timestamp metadata.
    const select = (template: string, projections: Record<string, string>) => `
      SELECT
        ${sqlString(template)}                                   AS _source_kind,
        d.id::text                                               AS _source_document_id,
        d.filename                                               AS _source_filename,
        e."overallScore"                                         AS _source_score,
        e."createdAt"                                            AS _source_created_at,
        ${projections.reference}                                 AS reference,
        ${projections.counterparty}                              AS counterparty,
        ${projections.date}                                      AS date,
        ${projections.due_date ?? 'NULL'}                        AS due_date,
        ${projections.expected_delivery ?? 'NULL'}               AS expected_delivery,
        (e.data->>'subtotal')::numeric                           AS subtotal,
        (e.data->>'tax')::numeric                                AS tax,
        (e.data->>'total_amount')::numeric                       AS total_amount,
        (e.data->>'currency')                                    AS currency,
        ${projections.payment_method ?? 'NULL'}                  AS payment_method,
        e.data::text                                             AS raw_data
      FROM ${schema}.${ex} e
      JOIN ${schema}.${doc} d ON d.id = e."documentId"
      WHERE d."workspaceId" = ${ws}
        AND e.template = ${sqlString(template)}
    `;

    const invoice = select('invoice', {
      reference:    `(e.data->>'invoice_number')`,
      counterparty: `COALESCE(e.data->>'customer_name', e.data->>'vendor_name')`,
      date:         `(e.data->>'date')`,
      due_date:     `(e.data->>'due_date')`,
    });

    const po = select('purchase_order', {
      reference:    `(e.data->>'po_number')`,
      counterparty: `COALESCE(e.data->>'supplier', e.data->>'buyer')`,
      date:         `(e.data->>'date')`,
      expected_delivery: `(e.data->>'expected_delivery')`,
    });

    const receipt = select('receipt', {
      reference:      `(e.data->>'receipt_number')`,
      counterparty:   `(e.data->>'merchant')`,
      date:           `(e.data->>'date')`,
      payment_method: `(e.data->>'payment_method')`,
    });

    const generic = select('generic', {
      reference:    `(e.data->>'title')`,
      counterparty: `NULL`,
      date:         `(e.data->>'date')`,
    });

    return `
      CREATE OR REPLACE VIEW ${schema}.${view} AS
      ${invoice}
      UNION ALL
      ${po}
      UNION ALL
      ${receipt}
      UNION ALL
      ${generic};
    `.trim();
  }

  function ident(name: string): string {
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
      throw new Error(`Unsafe SQL identifier: ${name}`);
    }
    return `"${name}"`;
  }
  function sqlString(s: string): string {
    return `'${s.replace(/'/g, "''")}'`;
  }
}

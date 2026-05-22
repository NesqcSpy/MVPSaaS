import { Injectable } from '@nestjs/common';

import { EtlBatch, EtlRow } from '../connectors/connector.interface';
import {
  ExtractionRecord,
  Transformation,
  TransformationContext,
} from './transformation.interface';

/**
 * Identity-shaped transformation that emits one row per record using the
 * record's own data dictionary, with optional rename mappings applied.
 * The unified column set is the union of every record's keys.
 *
 * Use this transformation when downstream wants per-template native
 * columns instead of a canonical schema (i.e., the operator is not
 * trying to merge templates).
 */
@Injectable()
export class FieldMappingTransformation implements Transformation {
  readonly id = 'field-mapping';

  apply(records: ExtractionRecord[], ctx: TransformationContext): EtlBatch {
    const columnSet = new Set<string>(['_source_document_id', '_source_kind']);
    const rows: EtlRow[] = [];

    for (const r of records) {
      const row: EtlRow = {
        _source_document_id: r.documentId,
        _source_kind: r.template,
      };
      for (const [k, v] of Object.entries(r.data)) {
        const dest = ctx.fieldMappings?.[k] ?? k;
        row[dest] = coerce(v);
        columnSet.add(dest);
      }
      rows.push(row);
    }

    const columns = Array.from(columnSet);
    // Fill missing columns with null so every row is rectangular.
    for (const row of rows) {
      for (const c of columns) if (!(c in row)) row[c] = null;
    }

    return {
      destination: ctx.destination,
      columns,
      rows,
      meta: { transformation: this.id },
    };
  }
}

function coerce(v: unknown): EtlRow[string] {
  if (v === null || v === undefined) return null;
  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return v;
  if (v instanceof Date) return v;
  // Objects → JSON string so the row stays flat
  return JSON.stringify(v);
}

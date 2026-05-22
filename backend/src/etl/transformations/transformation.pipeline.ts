import { Injectable } from '@nestjs/common';

import { EtlBatch } from '../connectors/connector.interface';
import {
  ExtractionRecord,
  Transformation,
  TransformationContext,
} from './transformation.interface';
import { UnionAllTransformation } from './union-all.transformation';
import { FieldMappingTransformation } from './field-mapping.transformation';

export type TransformationId = 'union-all' | 'field-mapping';

/**
 * Resolves a transformation id (configured on a pipeline) to a runnable
 * Transformation implementation. UNION ALL is the default — it's the
 * shape downstream BI tools and warehouses are happiest with.
 */
@Injectable()
export class TransformationPipeline {
  private readonly registry: Record<TransformationId, Transformation>;

  constructor(unionAll: UnionAllTransformation, fieldMapping: FieldMappingTransformation) {
    this.registry = {
      'union-all': unionAll,
      'field-mapping': fieldMapping,
    };
  }

  async run(
    id: TransformationId,
    records: ExtractionRecord[],
    ctx: TransformationContext,
  ): Promise<EtlBatch> {
    const t = this.registry[id] ?? this.registry['union-all'];
    return await t.apply(records, ctx);
  }

  get(id: TransformationId): Transformation {
    return this.registry[id] ?? this.registry['union-all'];
  }

  list(): TransformationId[] {
    return Object.keys(this.registry) as TransformationId[];
  }
}

import { IntegrationKind } from '@prisma/client';

/**
 * Generic row shape that flows from ETL transformations into sinks. The
 * value union is what JSON can carry — keep this loose; sinks coerce.
 */
export type EtlRow = Record<string, string | number | boolean | null | Date>;

export interface EtlBatch {
  /** Logical destination "table" / endpoint / file root. */
  destination: string;
  /** Unified column order; every row promises to have these keys. */
  columns: string[];
  rows: EtlRow[];
  meta?: Record<string, unknown>;
}

export interface ConnectorWriteResult {
  rowsWritten: number;
  destination: string;
  meta?: Record<string, unknown>;
}

/**
 * A sink that can accept normalized batches. Connectors are stateless
 * wrappers around credentials + config; one instance per call is fine.
 */
export interface Connector {
  readonly kind: IntegrationKind;
  /** Throws if config/credentials don't form a valid connection. */
  test(): Promise<void>;
  /** Write the batch idempotently when possible. */
  write(batch: EtlBatch): Promise<ConnectorWriteResult>;
  /** Free underlying resources (db pools, file handles). */
  close?(): Promise<void>;
}

export interface ConnectorConfig {
  /** Non-secret JSON config from Integration.config. */
  config: Record<string, unknown>;
  /** Decrypted credentials from Integration.credentialsEnc, or null. */
  credentials: Record<string, unknown> | null;
}

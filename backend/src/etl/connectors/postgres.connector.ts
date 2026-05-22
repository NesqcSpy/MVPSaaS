import { IntegrationKind } from '@prisma/client';
import { Pool, PoolClient } from 'pg';

import {
  Connector,
  ConnectorConfig,
  ConnectorWriteResult,
  EtlBatch,
  EtlRow,
} from './connector.interface';

interface PostgresCreds {
  host: string;
  port?: number;
  user: string;
  password: string;
  database: string;
  ssl?: boolean | { rejectUnauthorized?: boolean };
}

interface PostgresOptions {
  /** Target table name. */
  table: string;
  /** Optional schema (defaults to "public"). */
  schema?: string;
  /** Columns to use for ON CONFLICT — when set, write becomes upsert. */
  conflictKeys?: string[];
  /** Truncate the table before write. Mutually exclusive with conflictKeys. */
  truncate?: boolean;
  /** Auto-create table from batch.columns if it doesn't exist. */
  ensureTable?: boolean;
}

/**
 * Postgres sink. Uses a single transaction per batch, parameterized
 * inserts, and ON CONFLICT … DO UPDATE when `conflictKeys` is set.
 */
export class PostgresConnector implements Connector {
  readonly kind = IntegrationKind.POSTGRES;
  private pool: Pool | null = null;
  private readonly creds: PostgresCreds;
  private readonly opts: PostgresOptions;

  constructor(integration: ConnectorConfig) {
    this.creds = integration.credentials as unknown as PostgresCreds;
    this.opts = integration.config as unknown as PostgresOptions;
    this.assertValid();
  }

  private assertValid(): void {
    if (!this.creds?.host || !this.creds?.user || !this.creds?.database) {
      throw new Error('PostgresConnector: incomplete credentials');
    }
    if (!this.opts?.table) {
      throw new Error('PostgresConnector: config.table is required');
    }
  }

  private getPool(): Pool {
    if (!this.pool) {
      this.pool = new Pool({
        host: this.creds.host,
        port: this.creds.port ?? 5432,
        user: this.creds.user,
        password: this.creds.password,
        database: this.creds.database,
        ssl: this.creds.ssl,
        max: 4,
        idleTimeoutMillis: 30_000,
      });
    }
    return this.pool;
  }

  async test(): Promise<void> {
    const c = await this.getPool().connect();
    try { await c.query('SELECT 1'); } finally { c.release(); }
  }

  async write(batch: EtlBatch): Promise<ConnectorWriteResult> {
    const pool = this.getPool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      if (this.opts.ensureTable) {
        await this.ensureTable(client, batch.columns);
      }

      if (this.opts.truncate && !this.opts.conflictKeys?.length) {
        await client.query(`TRUNCATE TABLE ${this.qualifiedTable()}`);
      }

      const rowsWritten = await this.insertBatch(client, batch);
      await client.query('COMMIT');
      return { rowsWritten, destination: this.qualifiedTable() };
    } catch (err) {
      await client.query('ROLLBACK').catch(() => undefined);
      throw err;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool?.end();
    this.pool = null;
  }

  private qualifiedTable(): string {
    const schema = this.opts.schema ?? 'public';
    return `${quoteIdent(schema)}.${quoteIdent(this.opts.table)}`;
  }

  private async ensureTable(client: PoolClient, columns: string[]): Promise<void> {
    const cols = columns.map((c) => `${quoteIdent(c)} text`).join(', ');
    await client.query(
      `CREATE TABLE IF NOT EXISTS ${this.qualifiedTable()} (
         id          uuid primary key default gen_random_uuid(),
         ${cols},
         created_at  timestamptz not null default now()
       )`,
    );
  }

  private async insertBatch(client: PoolClient, batch: EtlBatch): Promise<number> {
    if (batch.rows.length === 0) return 0;

    const cols = batch.columns;
    const placeholderRow = (rowIdx: number): string =>
      `(${cols.map((_, i) => `$${rowIdx * cols.length + i + 1}`).join(', ')})`;

    const chunkSize = 500;
    let total = 0;

    for (let i = 0; i < batch.rows.length; i += chunkSize) {
      const chunk = batch.rows.slice(i, i + chunkSize);
      const values = chunk.flatMap((r) => cols.map((c) => coerce(r[c])));
      const placeholders = chunk.map((_, idx) => placeholderRow(idx)).join(', ');

      let sql = `INSERT INTO ${this.qualifiedTable()} (${cols.map(quoteIdent).join(', ')}) VALUES ${placeholders}`;
      if (this.opts.conflictKeys?.length) {
        const updates = cols
          .filter((c) => !this.opts.conflictKeys!.includes(c))
          .map((c) => `${quoteIdent(c)} = EXCLUDED.${quoteIdent(c)}`)
          .join(', ');
        sql += ` ON CONFLICT (${this.opts.conflictKeys.map(quoteIdent).join(', ')}) DO UPDATE SET ${updates}`;
      }

      const res = await client.query(sql, values);
      total += res.rowCount ?? chunk.length;
    }

    return total;
  }
}

function quoteIdent(name: string): string {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
    throw new Error(`Unsafe SQL identifier: ${name}`);
  }
  return `"${name}"`;
}

function coerce(v: EtlRow[string]): unknown {
  if (v instanceof Date) return v.toISOString();
  return v ?? null;
}

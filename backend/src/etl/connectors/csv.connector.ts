import { IntegrationKind } from '@prisma/client';
import { stringify } from 'csv-stringify/sync';
import { promises as fs } from 'fs';
import * as path from 'path';

import { AppConfig } from '../../config/configuration';
import {
  Connector,
  ConnectorConfig,
  ConnectorWriteResult,
  EtlBatch,
  EtlRow,
} from './connector.interface';

interface CsvOptions {
  /** Filename root (the path is rooted at STORAGE_LOCAL_PATH/exports/<workspaceId>). */
  filename: string;
  /** Append mode — false replaces the file each run. Default: false. */
  append?: boolean;
  delimiter?: string;
  /** Workspace id, used to root the export under per-tenant directories. */
  workspaceId: string;
}

export class CsvConnector implements Connector {
  readonly kind = IntegrationKind.CSV;
  private readonly opts: CsvOptions;
  private readonly rootDir: string;

  constructor(integration: ConnectorConfig, cfg: AppConfig) {
    this.opts = integration.config as unknown as CsvOptions;
    if (!this.opts?.filename || !this.opts?.workspaceId) {
      throw new Error('CsvConnector: config.filename and config.workspaceId are required');
    }
    this.rootDir = path.resolve(
      cfg.storage.localPath,
      'exports',
      this.opts.workspaceId,
    );
  }

  async test(): Promise<void> {
    await fs.mkdir(this.rootDir, { recursive: true });
  }

  async write(batch: EtlBatch): Promise<ConnectorWriteResult> {
    await fs.mkdir(this.rootDir, { recursive: true });
    const target = path.join(this.rootDir, this.safeName(this.opts.filename));
    const exists = await this.fileExists(target);
    const append = !!this.opts.append && exists;

    const header = !append; // emit headers only when starting a fresh file
    const body = stringify(batch.rows.map((r) => this.flatten(r, batch.columns)), {
      header,
      columns: batch.columns,
      delimiter: this.opts.delimiter ?? ',',
      quoted_string: true,
    });

    if (append) {
      await fs.appendFile(target, body);
    } else {
      await fs.writeFile(target, body);
    }
    return {
      rowsWritten: batch.rows.length,
      destination: target,
      meta: { append },
    };
  }

  private flatten(row: EtlRow, cols: string[]): Record<string, string | number | boolean | null> {
    const out: Record<string, string | number | boolean | null> = {};
    for (const c of cols) {
      const v = row[c];
      out[c] = v instanceof Date ? v.toISOString() : (v ?? null);
    }
    return out;
  }

  private safeName(name: string): string {
    return name.replace(/[^A-Za-z0-9_.-]+/g, '_').slice(0, 200);
  }

  private async fileExists(p: string): Promise<boolean> {
    try {
      await fs.stat(p);
      return true;
    } catch {
      return false;
    }
  }
}

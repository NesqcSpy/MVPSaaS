import { IntegrationKind } from '@prisma/client';
import ExcelJS from 'exceljs';
import { promises as fs } from 'fs';
import * as path from 'path';

import { AppConfig } from '../../config/configuration';
import {
  Connector,
  ConnectorConfig,
  ConnectorWriteResult,
  EtlBatch,
} from './connector.interface';

interface ExcelOptions {
  filename: string;
  sheetName?: string;
  workspaceId: string;
  /** Append mode opens the existing file and appends rows to the sheet. */
  append?: boolean;
}

export class ExcelConnector implements Connector {
  readonly kind = IntegrationKind.EXCEL;
  private readonly opts: ExcelOptions;
  private readonly rootDir: string;

  constructor(integration: ConnectorConfig, cfg: AppConfig) {
    this.opts = integration.config as unknown as ExcelOptions;
    if (!this.opts?.filename || !this.opts?.workspaceId) {
      throw new Error('ExcelConnector: config.filename and config.workspaceId are required');
    }
    this.rootDir = path.resolve(cfg.storage.localPath, 'exports', this.opts.workspaceId);
  }

  async test(): Promise<void> {
    await fs.mkdir(this.rootDir, { recursive: true });
  }

  async write(batch: EtlBatch): Promise<ConnectorWriteResult> {
    await fs.mkdir(this.rootDir, { recursive: true });
    const target = path.join(this.rootDir, this.safeName(this.opts.filename));
    const sheetName = this.opts.sheetName ?? 'Sheet1';

    const wb = new ExcelJS.Workbook();
    let sheet: ExcelJS.Worksheet;

    if (this.opts.append && (await this.fileExists(target))) {
      await wb.xlsx.readFile(target);
      sheet = wb.getWorksheet(sheetName) ?? wb.addWorksheet(sheetName);
    } else {
      sheet = wb.addWorksheet(sheetName);
      sheet.columns = batch.columns.map((c) => ({ header: c, key: c, width: 20 }));
    }

    // If the sheet was just created or had no rows, write the header row.
    if (sheet.rowCount === 0) {
      sheet.addRow(batch.columns);
    }

    for (const row of batch.rows) {
      sheet.addRow(
        batch.columns.map((c) => {
          const v = row[c];
          return v instanceof Date ? v.toISOString() : v;
        }),
      );
    }

    await wb.xlsx.writeFile(target);
    return { rowsWritten: batch.rows.length, destination: target };
  }

  private safeName(name: string): string {
    return name.replace(/[^A-Za-z0-9_.-]+/g, '_').slice(0, 200);
  }

  private async fileExists(p: string): Promise<boolean> {
    try { await fs.stat(p); return true; } catch { return false; }
  }
}

import { IntegrationKind } from '@prisma/client';

import {
  Connector,
  ConnectorConfig,
  ConnectorWriteResult,
  EtlBatch,
} from './connector.interface';

/**
 * SQL Server sink. Implementation slot — to activate, `pnpm add mssql`
 * and replace the body with a tedious ConnectionPool + Request batch.
 *
 *   const pool = await sql.connect(config);
 *   const table = new sql.Table(opts.table);
 *   batch.columns.forEach(c => table.columns.add(c, sql.NVarChar(sql.MAX), { nullable: true }));
 *   batch.rows.forEach(r => table.rows.add(...batch.columns.map(c => r[c] ?? null)));
 *   await new sql.Request(pool).bulk(table);
 */
export class MssqlConnector implements Connector {
  readonly kind = IntegrationKind.MSSQL;

  constructor(_integration: ConnectorConfig) {}

  async test(): Promise<void> {
    throw new Error('MssqlConnector not yet implemented — install mssql and complete the connector');
  }

  async write(_batch: EtlBatch): Promise<ConnectorWriteResult> {
    throw new Error('MssqlConnector not yet implemented');
  }
}

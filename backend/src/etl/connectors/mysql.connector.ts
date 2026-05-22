import { IntegrationKind } from '@prisma/client';

import {
  Connector,
  ConnectorConfig,
  ConnectorWriteResult,
  EtlBatch,
} from './connector.interface';

/**
 * MySQL sink. Implementation slot — to activate, `pnpm add mysql2` and
 * replace the throw with a mysql2/promise pool. The shape matches
 * PostgresConnector intentionally so swapping is one line of config.
 *
 *   const pool = await mysql.createPool({...});
 *   await pool.query(
 *     `INSERT INTO ?? (${cols.map(()=>'??').join(',')}) VALUES ?`,
 *     [table, ...cols, rows.map(r => cols.map(c => r[c] ?? null))]
 *   );
 *   if (conflictKeys) → "ON DUPLICATE KEY UPDATE col=VALUES(col), ..."
 */
export class MysqlConnector implements Connector {
  readonly kind = IntegrationKind.MYSQL;

  constructor(_integration: ConnectorConfig) {}

  async test(): Promise<void> {
    throw new Error('MysqlConnector not yet implemented — install mysql2 and complete the connector');
  }

  async write(_batch: EtlBatch): Promise<ConnectorWriteResult> {
    throw new Error('MysqlConnector not yet implemented');
  }
}

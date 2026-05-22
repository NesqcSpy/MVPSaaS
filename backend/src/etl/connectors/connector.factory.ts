import { Injectable } from '@nestjs/common';
import { IntegrationKind } from '@prisma/client';

import { Connector, ConnectorConfig } from './connector.interface';
import { PostgresConnector } from './postgres.connector';
import { MysqlConnector } from './mysql.connector';
import { MssqlConnector } from './mssql.connector';
import { CsvConnector } from './csv.connector';
import { ExcelConnector } from './excel.connector';
import { HttpConnector } from './http.connector';
import { AppConfig } from '../../config/configuration';

@Injectable()
export class ConnectorFactory {
  constructor(private readonly cfg: AppConfig) {}

  create(kind: IntegrationKind, integration: ConnectorConfig): Connector {
    switch (kind) {
      case IntegrationKind.POSTGRES:
        return new PostgresConnector(integration);
      case IntegrationKind.MYSQL:
        return new MysqlConnector(integration);
      case IntegrationKind.MSSQL:
        return new MssqlConnector(integration);
      case IntegrationKind.CSV:
        return new CsvConnector(integration, this.cfg);
      case IntegrationKind.EXCEL:
        return new ExcelConnector(integration, this.cfg);
      case IntegrationKind.HTTP_API:
      case IntegrationKind.WEBHOOK:
        return new HttpConnector(integration);
      default: {
        const _exhaustive: never = kind;
        throw new Error(`Unsupported integration kind: ${_exhaustive}`);
      }
    }
  }
}

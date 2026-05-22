import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  IntegrationKind,
  PipelineStatus,
  Prisma,
  ValidationStatus,
} from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { ConnectorFactory } from './connectors/connector.factory';
import { CredentialsCryptoService } from './security/credentials.service';
import {
  TransformationPipeline,
} from './transformations/transformation.pipeline';
import {
  ExtractionRecord,
  TransformationContext,
} from './transformations/transformation.interface';
import { ConnectorWriteResult } from './connectors/connector.interface';

/**
 * Pipeline definition shape persisted in Pipeline.definition. We keep this
 * server-side so the schema can evolve without breaking the JSON column.
 */
interface PipelineDefinition {
  integrationId: string;
  destination: string;
  transformation: 'union-all' | 'field-mapping';
  fieldMappings?: Record<string, string>;
  templates?: string[];
  lastRunAt?: string;
}

export interface ExportRunResult extends ConnectorWriteResult {
  pipelineId: string;
  recordCount: number;
  transformation: string;
}

@Injectable()
export class EtlService {
  private readonly logger = new Logger(EtlService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly factory: ConnectorFactory,
    private readonly crypto: CredentialsCryptoService,
    private readonly transformations: TransformationPipeline,
  ) {}

  /**
   * Run a pipeline once. Inputs are either an explicit set of
   * documentIds or the catch-up window since the pipeline's last
   * successful run. Records are pulled from validated extractions,
   * transformed (UNION ALL by default), and written through the
   * connector resolved by the pipeline's Integration.
   */
  async runPipeline(pipelineId: string, opts: { documentIds?: string[] } = {}): Promise<ExportRunResult> {
    const pipeline = await this.prisma.pipeline.findFirst({
      where: { id: pipelineId, deletedAt: null },
    });
    if (!pipeline) throw new NotFoundException('Pipeline not found');
    if (pipeline.status !== PipelineStatus.ACTIVE) {
      throw new BadRequestException(`Pipeline is ${pipeline.status} — cannot run`);
    }

    const def = pipeline.definition as unknown as PipelineDefinition;
    if (!def?.integrationId || !def?.destination || !def?.transformation) {
      throw new BadRequestException('Pipeline definition is malformed');
    }

    const integration = await this.prisma.integration.findFirst({
      where: { id: def.integrationId, workspaceId: pipeline.workspaceId, deletedAt: null },
    });
    if (!integration || !integration.enabled) {
      throw new BadRequestException('Integration is missing or disabled');
    }

    const records = await this.collectRecords(pipeline.workspaceId, def, opts.documentIds);
    if (records.length === 0) {
      this.logger.log(`Pipeline ${pipeline.id}: no records to export`);
      return {
        rowsWritten: 0,
        destination: def.destination,
        pipelineId: pipeline.id,
        recordCount: 0,
        transformation: def.transformation,
      };
    }

    const ctx: TransformationContext = {
      workspaceId: pipeline.workspaceId,
      fieldMappings: def.fieldMappings,
      destination: def.destination,
    };
    const batch = await this.transformations.run(def.transformation, records, ctx);

    const connector = this.factory.create(integration.kind as IntegrationKind, {
      config: this.injectRuntimeConfig(integration.config as Record<string, unknown>, integration.kind, pipeline.workspaceId),
      credentials: this.crypto.decrypt(integration.credentialsEnc),
    });

    let writeResult: ConnectorWriteResult;
    try {
      await connector.test();
      writeResult = await connector.write(batch);
    } finally {
      await connector.close?.();
    }

    await this.prisma.pipeline.update({
      where: { id: pipeline.id },
      data: {
        definition: {
          ...def,
          lastRunAt: new Date().toISOString(),
        } as unknown as Prisma.InputJsonValue,
      },
    });

    this.logger.log(
      `Pipeline ${pipeline.id} ran: records=${records.length} rowsWritten=${writeResult.rowsWritten} dest=${writeResult.destination}`,
    );

    return {
      ...writeResult,
      pipelineId: pipeline.id,
      recordCount: records.length,
      transformation: def.transformation,
    };
  }

  /**
   * Quick provider connectivity check — useful from the Integrations UI
   * before saving a config. Doesn't persist anything.
   */
  async testIntegration(integrationId: string, workspaceId: string): Promise<{ ok: boolean; error?: string }> {
    const integration = await this.prisma.integration.findFirst({
      where: { id: integrationId, workspaceId, deletedAt: null },
    });
    if (!integration) throw new NotFoundException('Integration not found');

    const connector = this.factory.create(integration.kind, {
      config: this.injectRuntimeConfig(integration.config as Record<string, unknown>, integration.kind, workspaceId),
      credentials: this.crypto.decrypt(integration.credentialsEnc),
    });
    try {
      await connector.test();
      await this.prisma.integration.update({
        where: { id: integration.id },
        data: { lastTestedAt: new Date(), lastTestStatus: 'ok' },
      });
      return { ok: true };
    } catch (err) {
      const message = (err as Error).message ?? 'unknown';
      await this.prisma.integration.update({
        where: { id: integration.id },
        data: { lastTestedAt: new Date(), lastTestStatus: `failed: ${message.slice(0, 200)}` },
      });
      return { ok: false, error: message };
    } finally {
      await connector.close?.();
    }
  }

  /**
   * Read validated extractions matching the pipeline filter. When
   * documentIds is empty/undefined we use the catch-up window: only
   * results newer than the last successful run.
   */
  private async collectRecords(
    workspaceId: string,
    def: PipelineDefinition,
    documentIds?: string[],
  ): Promise<ExtractionRecord[]> {
    const where: Prisma.ExtractionResultWhereInput = {
      document: {
        workspaceId,
        deletedAt: null,
        validationResult: { is: { status: { in: [ValidationStatus.PASSED, ValidationStatus.PASSED_WITH_WARNINGS] } } },
      },
      ...(def.templates?.length ? { template: { in: def.templates } } : {}),
      ...(documentIds?.length
        ? { documentId: { in: documentIds } }
        : def.lastRunAt
          ? { createdAt: { gt: new Date(def.lastRunAt) } }
          : {}),
    };

    const rows = await this.prisma.extractionResult.findMany({
      where,
      include: { document: { select: { id: true, workspaceId: true, filename: true } } },
      orderBy: { createdAt: 'asc' },
    });

    return rows.map((row) => ({
      documentId: row.documentId,
      workspaceId: row.document.workspaceId,
      template: row.template,
      filename: row.document.filename,
      data: (row.data as Record<string, unknown>) ?? {},
      fieldScores: (row.fieldScores as Record<string, number>) ?? {},
      overallScore: row.overallScore,
      createdAt: row.createdAt,
    }));
  }

  /**
   * Some connectors need workspace-scoped values that aren't part of the
   * persisted config (e.g. CsvConnector roots its exports under
   * STORAGE_LOCAL_PATH/exports/<workspaceId>). Inject those at call time
   * so they never live in the DB.
   */
  private injectRuntimeConfig(
    config: Record<string, unknown>,
    kind: IntegrationKind,
    workspaceId: string,
  ): Record<string, unknown> {
    switch (kind) {
      case IntegrationKind.CSV:
      case IntegrationKind.EXCEL:
        return { ...config, workspaceId };
      default:
        return config;
    }
  }
}

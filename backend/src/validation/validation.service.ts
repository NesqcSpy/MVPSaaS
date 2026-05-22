import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DocumentStatus, ValidationStatus } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { DocumentsRepository } from '../documents/documents.repository';
import { RuleRegistry } from './rules/rule.registry';
import { ValidationContext, ValidationIssue } from './rules/rule.interface';

export interface ValidationReport {
  status: ValidationStatus;
  issues: ValidationIssue[];
}

@Injectable()
export class ValidationService {
  private readonly logger = new Logger(ValidationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly documents: DocumentsRepository,
    private readonly registry: RuleRegistry,
  ) {}

  /**
   * Run every applicable rule over the document's extraction result.
   * Issue severity rolls up into the document-level status:
   *   - any 'error'   → FAILED
   *   - any 'warning' → PASSED_WITH_WARNINGS
   *   - otherwise     → PASSED
   */
  async runForDocument(documentId: string): Promise<ValidationReport> {
    const doc = await this.prisma.document.findUnique({
      where: { id: documentId },
      include: { extractionResult: true },
    });
    if (!doc) throw new NotFoundException(`Document ${documentId} not found`);
    if (!doc.extractionResult) {
      throw new NotFoundException(`Extraction result missing for document ${documentId}`);
    }

    await this.documents.updateStatus(doc.id, DocumentStatus.VALIDATING, null);

    const ctx: ValidationContext = {
      documentId: doc.id,
      workspaceId: doc.workspaceId,
      template: doc.extractionResult.template,
      data: doc.extractionResult.data as Record<string, unknown>,
      fieldScores: (doc.extractionResult.fieldScores as Record<string, number>) ?? {},
    };

    const rules = this.registry.forTemplate(ctx.template);
    const issues: ValidationIssue[] = [];
    for (const rule of rules) {
      try {
        const out = await rule.run(ctx);
        issues.push(...out);
      } catch (err) {
        this.logger.error(
          { rule: rule.id, documentId: doc.id, err: (err as Error).message },
          'Validation rule threw',
        );
        issues.push({
          field: '',
          rule: rule.id,
          severity: 'warning',
          message: `Rule "${rule.id}" failed to execute: ${(err as Error).message}`,
        });
      }
    }

    const status = this.rollup(issues);

    await this.prisma.validationResult.upsert({
      where: { documentId: doc.id },
      create: {
        documentId: doc.id,
        status,
        issues: issues as unknown as object,
      },
      update: {
        status,
        issues: issues as unknown as object,
      },
    });

    await this.documents.updateStatus(
      doc.id,
      status === ValidationStatus.FAILED ? DocumentStatus.FAILED : DocumentStatus.VALIDATED,
      status === ValidationStatus.FAILED
        ? issues.filter((i) => i.severity === 'error').slice(0, 3).map((i) => `${i.field}: ${i.message}`).join('; ')
        : null,
    );

    this.logger.log(
      `Validation complete: doc=${doc.id} status=${status} issues=${issues.length}`,
    );
    return { status, issues };
  }

  private rollup(issues: ValidationIssue[]): ValidationStatus {
    if (issues.some((i) => i.severity === 'error')) return ValidationStatus.FAILED;
    if (issues.some((i) => i.severity === 'warning')) return ValidationStatus.PASSED_WITH_WARNINGS;
    return ValidationStatus.PASSED;
  }
}

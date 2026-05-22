import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ValidationContext, ValidationIssue, ValidationRule } from './rule.interface';

/**
 * Flags extraction results that share the same business identifier
 * (invoice/PO/receipt number) inside the same workspace. We don't block —
 * a duplicate is a warning so the user can decide whether to merge,
 * reprocess, or accept (some workflows expect duplicates intentionally).
 */
@Injectable()
export class DuplicateDetectionRule implements ValidationRule {
  readonly id = 'duplicate';
  readonly templates = ['invoice', 'purchase_order', 'receipt'] as const;

  constructor(private readonly prisma: PrismaService) {}

  private readonly idField: Record<string, string> = {
    invoice: 'invoice_number',
    purchase_order: 'po_number',
    receipt: 'receipt_number',
  };

  async run(ctx: ValidationContext): Promise<ValidationIssue[]> {
    const field = this.idField[ctx.template];
    if (!field) return [];
    const id = ctx.data[field];
    if (typeof id !== 'string' || id.length === 0) return [];

    // Use Prisma's JSON path query to find sibling extractions in the same
    // workspace with the same business identifier and a different doc id.
    const matches = await this.prisma.extractionResult.findMany({
      where: {
        document: { workspaceId: ctx.workspaceId, deletedAt: null },
        template: ctx.template,
        documentId: { not: ctx.documentId },
        data: {
          path: [field],
          equals: id,
        },
      },
      select: { documentId: true, createdAt: true },
      take: 5,
    });

    if (matches.length === 0) return [];
    return [
      {
        field,
        rule: this.id,
        severity: 'warning',
        message: `Duplicate ${field}="${id}" found on ${matches.length} other document(s)`,
        context: { duplicates: matches.map((m) => m.documentId) },
      },
    ];
  }
}

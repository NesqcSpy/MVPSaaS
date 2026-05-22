import { Injectable } from '@nestjs/common';
import { ValidationContext, ValidationIssue, ValidationRule } from './rule.interface';
import { ISO_DATE_RE } from '../../extraction/field-normalizer';

/**
 * Cross-field business rules — the cheap-to-codify domain logic every
 * AP/operations team eventually writes. These run after type checks so
 * we can assume well-typed inputs when the value is present.
 */
@Injectable()
export class BusinessRule implements ValidationRule {
  readonly id = 'business';
  readonly templates = ['invoice', 'purchase_order'] as const;

  run(ctx: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Invoice: due_date must be >= date.
    if (ctx.template === 'invoice') {
      const issued = ctx.data.date;
      const due = ctx.data.due_date;
      if (
        typeof issued === 'string' && ISO_DATE_RE.test(issued) &&
        typeof due === 'string' && ISO_DATE_RE.test(due) &&
        due < issued
      ) {
        issues.push({
          field: 'due_date',
          rule: this.id,
          severity: 'error',
          message: `due_date (${due}) is before invoice date (${issued})`,
        });
      }
    }

    // PO: expected_delivery must be >= date.
    if (ctx.template === 'purchase_order') {
      const ordered = ctx.data.date;
      const delivery = ctx.data.expected_delivery;
      if (
        typeof ordered === 'string' && ISO_DATE_RE.test(ordered) &&
        typeof delivery === 'string' && ISO_DATE_RE.test(delivery) &&
        delivery < ordered
      ) {
        issues.push({
          field: 'expected_delivery',
          rule: this.id,
          severity: 'error',
          message: `expected_delivery (${delivery}) is before PO date (${ordered})`,
        });
      }
    }

    // Low extraction confidence → escalate to warning.
    for (const [field, score] of Object.entries(ctx.fieldScores ?? {})) {
      if (score < 0.5 && field in ctx.data && ctx.data[field] != null) {
        issues.push({
          field,
          rule: this.id,
          severity: 'info',
          message: `Low extraction confidence on "${field}" (${score.toFixed(2)}) — recommend manual review`,
        });
      }
    }

    return issues;
  }
}

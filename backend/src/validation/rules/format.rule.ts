import { Injectable } from '@nestjs/common';
import { ValidationContext, ValidationIssue, ValidationRule } from './rule.interface';

/**
 * Surface-level format checks separate from the type check rule —
 * lengths, character classes, sane ranges. These tend to catch real OCR
 * misreads (a "1" picked up as "I", spurious whitespace, etc.).
 */
@Injectable()
export class FormatRule implements ValidationRule {
  readonly id = 'format';
  readonly templates = ['*'] as const;

  run(ctx: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    for (const idField of ['invoice_number', 'po_number', 'receipt_number']) {
      const v = ctx.data[idField];
      if (typeof v === 'string') {
        if (v.length > 64) {
          issues.push({
            field: idField,
            rule: this.id,
            severity: 'warning',
            message: `"${idField}" suspiciously long (${v.length} chars)`,
          });
        }
        if (/^[^A-Za-z0-9]/.test(v)) {
          issues.push({
            field: idField,
            rule: this.id,
            severity: 'warning',
            message: `"${idField}" starts with a non-alphanumeric character: "${v[0]}"`,
          });
        }
      }
    }

    const total = ctx.data.total_amount;
    if (typeof total === 'number') {
      if (total > 1_000_000_000) {
        issues.push({
          field: 'total_amount',
          rule: this.id,
          severity: 'warning',
          message: `total_amount=${total} is implausibly large — likely OCR drift`,
        });
      }
    }

    const subtotal = ctx.data.subtotal;
    const tax = ctx.data.tax;
    if (typeof total === 'number' && typeof subtotal === 'number' && typeof tax === 'number') {
      const reconstructed = subtotal + tax;
      const drift = Math.abs(reconstructed - total);
      const tolerance = Math.max(0.02, total * 0.01); // 1% or 2¢, whichever is larger
      if (drift > tolerance) {
        issues.push({
          field: 'total_amount',
          rule: this.id,
          severity: 'warning',
          message: `subtotal+tax (${reconstructed.toFixed(2)}) doesn't match total (${total.toFixed(2)})`,
          context: { subtotal, tax, total, drift },
        });
      }
    }

    return issues;
  }
}

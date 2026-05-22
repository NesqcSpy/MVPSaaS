import { Injectable } from '@nestjs/common';
import { ValidationContext, ValidationIssue, ValidationRule } from './rule.interface';

/**
 * Each template advertises its required fields via the template's
 * `requiredFields` array; this rule re-derives that list from the data
 * dictionary (since by the time we validate, we no longer have the
 * template instance). The list below mirrors the template definitions.
 */
const REQUIRED: Record<string, string[]> = {
  invoice: ['invoice_number', 'date', 'total_amount', 'currency'],
  receipt: ['date', 'total_amount', 'currency'],
  purchase_order: ['po_number', 'date', 'total_amount', 'currency'],
  generic: [],
};

@Injectable()
export class RequiredFieldsRule implements ValidationRule {
  readonly id = 'required';
  readonly templates = ['*'] as const;

  run(ctx: ValidationContext): ValidationIssue[] {
    const required = REQUIRED[ctx.template] ?? [];
    const issues: ValidationIssue[] = [];
    for (const field of required) {
      const v = ctx.data[field];
      if (v === null || v === undefined || v === '') {
        issues.push({
          field,
          rule: this.id,
          severity: 'error',
          message: `Field "${field}" is required for template "${ctx.template}" but was empty`,
        });
      }
    }
    return issues;
  }
}

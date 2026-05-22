import { Injectable } from '@nestjs/common';
import { ValidationContext, ValidationIssue, ValidationRule } from './rule.interface';
import { ISO_DATE_RE } from '../../extraction/field-normalizer';

type ExpectedType = 'number' | 'iso-date' | 'currency-code' | 'string';

const TYPE_MAP: Record<string, ExpectedType> = {
  total_amount: 'number',
  subtotal: 'number',
  tax: 'number',
  date: 'iso-date',
  due_date: 'iso-date',
  expected_delivery: 'iso-date',
  currency: 'currency-code',
  invoice_number: 'string',
  po_number: 'string',
  receipt_number: 'string',
  customer_name: 'string',
  vendor_name: 'string',
  buyer: 'string',
  supplier: 'string',
  merchant: 'string',
};

@Injectable()
export class TypeCheckRule implements ValidationRule {
  readonly id = 'type';
  readonly templates = ['*'] as const;

  run(ctx: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    for (const [field, expected] of Object.entries(TYPE_MAP)) {
      if (!(field in ctx.data)) continue;
      const raw = ctx.data[field];
      if (raw === null || raw === undefined) continue;

      switch (expected) {
        case 'number':
          if (typeof raw !== 'number' || !Number.isFinite(raw)) {
            issues.push(this.bad(field, expected, raw));
          } else if (raw < 0) {
            issues.push({
              field,
              rule: this.id,
              severity: 'warning',
              message: `Field "${field}" is negative (${raw})`,
            });
          }
          break;

        case 'iso-date':
          if (typeof raw !== 'string' || !ISO_DATE_RE.test(raw)) {
            issues.push(this.bad(field, expected, raw));
          }
          break;

        case 'currency-code':
          if (typeof raw !== 'string' || !/^[A-Z]{3}$/.test(raw)) {
            issues.push(this.bad(field, expected, raw));
          }
          break;

        case 'string':
          if (typeof raw !== 'string' || raw.trim().length === 0) {
            issues.push(this.bad(field, expected, raw));
          }
          break;
      }
    }
    return issues;
  }

  private bad(field: string, expected: ExpectedType, got: unknown): ValidationIssue {
    return {
      field,
      rule: this.id,
      severity: 'error',
      message: `Field "${field}" is malformed (expected ${expected}, got ${typeof got})`,
      context: { expected, got },
    };
  }
}

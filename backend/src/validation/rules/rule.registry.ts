import { Injectable } from '@nestjs/common';
import { ValidationRule } from './rule.interface';
import { RequiredFieldsRule } from './required-fields.rule';
import { TypeCheckRule } from './type-check.rule';
import { DuplicateDetectionRule } from './duplicate-detection.rule';
import { FormatRule } from './format.rule';
import { BusinessRule } from './business.rule';

@Injectable()
export class RuleRegistry {
  private readonly rules: ValidationRule[];

  constructor(
    required: RequiredFieldsRule,
    types: TypeCheckRule,
    duplicates: DuplicateDetectionRule,
    format: FormatRule,
    business: BusinessRule,
  ) {
    // Order matters: cheap structural checks first, expensive DB checks last.
    this.rules = [required, types, format, business, duplicates];
  }

  /** Returns the rules that apply to a given template. */
  forTemplate(template: string): ValidationRule[] {
    return this.rules.filter(
      (r) => r.templates.includes('*') || r.templates.includes(template),
    );
  }

  all(): ValidationRule[] {
    return [...this.rules];
  }
}

import { Module } from '@nestjs/common';

import { ValidationService } from './validation.service';
import { ValidationProcessor } from './validation.processor';
import { ValidationController } from './validation.controller';

import { RuleRegistry } from './rules/rule.registry';
import { RequiredFieldsRule } from './rules/required-fields.rule';
import { TypeCheckRule } from './rules/type-check.rule';
import { DuplicateDetectionRule } from './rules/duplicate-detection.rule';
import { FormatRule } from './rules/format.rule';
import { BusinessRule } from './rules/business.rule';

import { DocumentsModule } from '../documents/documents.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';

@Module({
  imports: [DocumentsModule, WorkspacesModule],
  controllers: [ValidationController],
  providers: [
    ValidationService,
    ValidationProcessor,
    RuleRegistry,
    RequiredFieldsRule,
    TypeCheckRule,
    DuplicateDetectionRule,
    FormatRule,
    BusinessRule,
  ],
  exports: [ValidationService, RuleRegistry],
})
export class ValidationModule {}

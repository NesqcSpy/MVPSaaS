import { Module } from '@nestjs/common';

import { ExtractionService } from './extraction.service';
import { ExtractionController } from './extraction.controller';
import { ExtractionProcessor } from './extraction.processor';
import { TemplateRegistry } from './templates/template.registry';
import { InvoiceTemplate } from './templates/invoice.template';
import { ReceiptTemplate } from './templates/receipt.template';
import { PurchaseOrderTemplate } from './templates/purchase-order.template';
import { GenericTemplate } from './templates/generic.template';

import { DocumentsModule } from '../documents/documents.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';

@Module({
  imports: [DocumentsModule, WorkspacesModule],
  controllers: [ExtractionController],
  providers: [
    ExtractionService,
    ExtractionProcessor,
    TemplateRegistry,
    InvoiceTemplate,
    ReceiptTemplate,
    PurchaseOrderTemplate,
    GenericTemplate,
  ],
  exports: [ExtractionService, TemplateRegistry],
})
export class ExtractionModule {}

import { Injectable } from '@nestjs/common';
import { DocumentKind } from '@prisma/client';

import { ExtractionTemplate, TemplateExtraction } from './template.interface';
import { InvoiceTemplate } from './invoice.template';
import { ReceiptTemplate } from './receipt.template';
import { PurchaseOrderTemplate } from './purchase-order.template';
import { GenericTemplate } from './generic.template';

/**
 * Selects the right template for a (kind, text) pair. Selection is
 * primarily by document kind; if the kind doesn't match a registered
 * template we run all of them and pick the one with the highest score.
 */
@Injectable()
export class TemplateRegistry {
  private readonly templates: ExtractionTemplate[];
  private readonly byKind: Map<DocumentKind, ExtractionTemplate>;

  constructor(
    invoice: InvoiceTemplate,
    receipt: ReceiptTemplate,
    purchaseOrder: PurchaseOrderTemplate,
    generic: GenericTemplate,
  ) {
    this.templates = [invoice, receipt, purchaseOrder, generic];
    this.byKind = new Map(this.templates.map((t) => [t.kind, t]));
  }

  /**
   * Run the template chosen by `kind`. When kind is GENERIC the registry
   * tries every specialized template and returns the best-scoring one — so
   * uploads without an explicit kind still get the strongest possible read.
   */
  select(kind: DocumentKind, rawText: string): { template: ExtractionTemplate; extraction: TemplateExtraction } {
    if (kind !== DocumentKind.GENERIC) {
      const direct = this.byKind.get(kind);
      if (direct) return { template: direct, extraction: direct.extract(rawText) };
    }

    let best: { template: ExtractionTemplate; extraction: TemplateExtraction } | null = null;
    for (const t of this.templates) {
      if (t.kind === DocumentKind.GENERIC) continue;
      const extraction = t.extract(rawText);
      if (!best || extraction.overallScore > best.extraction.overallScore) {
        best = { template: t, extraction };
      }
    }

    // If nothing scored above a useful threshold, fall back to generic.
    const generic = this.byKind.get(DocumentKind.GENERIC)!;
    const genericExtraction = generic.extract(rawText);
    if (!best || genericExtraction.overallScore > best.extraction.overallScore) {
      return { template: generic, extraction: genericExtraction };
    }
    return best;
  }

  all(): ExtractionTemplate[] {
    return [...this.templates];
  }
}

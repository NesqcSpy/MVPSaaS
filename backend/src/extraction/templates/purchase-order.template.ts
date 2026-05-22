import { Injectable } from '@nestjs/common';
import { DocumentKind } from '@prisma/client';

import { ExtractedField, ExtractionTemplate, TemplateExtraction } from './template.interface';
import { computeScore } from './invoice.template';
import { parseAmount, parseCurrency, parseDate, pickFirst, tidyString } from '../field-normalizer';

const RE = {
  poNumber:
    /(?:p\.?\s*o\.?\s*(?:no\.?|number|#)|purchase\s*order\s*(?:no\.?|number|#)|orden\s*de\s*compra)[\s:]*([A-Z0-9][A-Z0-9\-_/]{2,})/i,
  poNumberFallback: /\b(PO[-_/][A-Z0-9\-_/]+)\b/i,

  date: /(?:po\s*date|order\s*date|fecha)[\s:]*([0-9]{1,4}[-/.\s][0-9A-Za-z]{1,9}[-/.\s][0-9]{2,4})/i,
  isoDate: /\b(\d{4}-\d{2}-\d{2})\b/,

  expectedDelivery:
    /(?:expected\s*delivery|delivery\s*date|fecha\s*de\s*entrega)[\s:]*([0-9]{1,4}[-/.\s][0-9A-Za-z]{1,9}[-/.\s][0-9]{2,4})/i,

  buyer: /(?:buyer|comprador|ship\s*to|cliente)[\s:]*([^\n\r]{2,80})/i,
  supplier: /(?:supplier|vendor|proveedor|seller)[\s:]*([^\n\r]{2,80})/i,
  total: /(?:order\s*total|total)[\s:$]*([0-9][0-9.,\s]*)/i,
  currency: /\b(USD|EUR|GBP|MXN|JPY|BRL|CAD|AUD|MX\$|US\$)\b|([$€£¥])/,
};

@Injectable()
export class PurchaseOrderTemplate implements ExtractionTemplate {
  readonly name = 'purchase_order';
  readonly kind = DocumentKind.PURCHASE_ORDER;

  readonly requiredFields = ['poNumber', 'date', 'totalAmount', 'currency'] as const;
  readonly optionalFields = ['expectedDelivery', 'buyer', 'supplier'] as const;

  extract(rawText: string): TemplateExtraction {
    const text = rawText.replace(/ /g, ' ');

    const poNumberRaw = pickFirst(RE.poNumber, text) ?? pickFirst(RE.poNumberFallback, text);
    const dateRaw = pickFirst(RE.date, text) ?? pickFirst(RE.isoDate, text);
    const expectedRaw = pickFirst(RE.expectedDelivery, text);
    const buyerRaw = pickFirst(RE.buyer, text);
    const supplierRaw = pickFirst(RE.supplier, text);
    const totalRaw = pickFirst(RE.total, text);
    const currencyRaw = pickFirst(RE.currency, text, 1) ?? pickFirst(RE.currency, text, 2);

    const poNumber = f(tidyString(poNumberRaw), poNumberRaw, 0.9);
    const date = f(parseDate(dateRaw), dateRaw, 0.9);
    const expectedDelivery = f(parseDate(expectedRaw), expectedRaw, 0.85);
    const buyer = f(tidyString(buyerRaw), buyerRaw, 0.7);
    const supplier = f(tidyString(supplierRaw), supplierRaw, 0.7);
    const totalAmount = f(parseAmount(totalRaw), totalRaw, 0.9);
    const currency = f(parseCurrency(currencyRaw), currencyRaw, 0.8);

    const fields: Record<string, ExtractedField> = {
      poNumber,
      date,
      expectedDelivery,
      buyer,
      supplier,
      totalAmount,
      currency,
    };

    const data = {
      po_number: poNumber.value,
      date: date.value,
      expected_delivery: expectedDelivery.value,
      buyer: buyer.value,
      supplier: supplier.value,
      total_amount: totalAmount.value,
      currency: currency.value,
    };

    return {
      template: this.name,
      data,
      fields,
      overallScore: computeScore(fields, this.requiredFields, this.optionalFields),
    };
  }
}

function f<T>(value: T | null, source: unknown, baseConfidence: number): ExtractedField<T> {
  return {
    value,
    confidence: value == null ? 0 : baseConfidence,
    source: source == null ? undefined : String(source).slice(0, 200),
  };
}
